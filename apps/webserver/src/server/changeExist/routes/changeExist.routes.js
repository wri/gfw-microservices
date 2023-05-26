const path = require('path');
const controller = require('../controllers/changeExist.controller');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app, limiter) => {
  /**
   * @name /changeExist
   * @see changeExist.controller
   * @memberof Router
   */

  // All methods must under /changeExist must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/changeExist', routeMiddlewares);

  app.get('/changeExist', controller.changeExist);

  app.post('/auth/updateExistingPass', middlewares.checkAuthentication, (req, res) => {
    const { currentPass, newPass } = req.body;
    AuthManager.changePassword(req, currentPass, newPass)
      .then((result) => res.send('PasswordChanged'))
      .catch((err) => res.send(err));
  });
};
