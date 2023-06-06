const path = require('path');
const controller = require('../controllers/change.controller');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));

const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /change
   * @see change.controller
   * @memberof Router
   */

  if (rateLimiterUtil.useRateLimiter()) {
    app.get(
      '/change',
      limiter(middlewares.rateLimitUnauthenticated),
      middlewares.checkRecognized,
      controller.change
    );
  } else {
    app.get('/change', middlewares.checkRecognized, controller.change);
  }

  // app.get('/change', middlewares, controller.change);

  app.post('/auth/updatePass', (request, response) => {
    const { currentPass, newPass } = request.body;
    AuthManager.setInitialPassword(request, currentPass, newPass)
      .then(() =>
        AuthManager.login(
          request,
          UserManager.getUserEmail(request),
          newPass,
          UserManager.isProManager(request)
        )
      )
      .then((result) => {
        const { authenticationStatus } = result;
        if (authenticationStatus === 1) {
          response.send('Authenticated');
        } else if (authenticationStatus === 2) {
          response.send('Unauthenticated');
        }
      })
      .catch((err) => response.send(err));
  });
};
