const path = require('path');
import { verify } from '../controllers/verify.controller';
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
   * @name /verify
   * @see verify.controller
   * @memberof Router
   */

  const routeMiddlewares = [middlewares.checkRecognized];
  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.get('/verify', routeMiddlewares, verify);

  app.post('/auth/verifyLogin', function (req, res) {
    console.log('POST /auth/verifyLogin');
    const { tokenID } = req.body;

    AuthManager.verifyLogin(req, tokenID)
      .then((result) => {
        //TODO: differentiate admin from normal user somehow! result.ispromanager ??
        //if we are a manager, res.send('something'), else res.send('something else')
        console.log('Verify: Success');
        if (UserManager.isProManager(req)) {
          res.send('Manager');
        } else if (result === 'multiple') {
          res.send('Select Org');
        } else {
          res.send('User');
        }
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });

  app.post('/auth/resendToken', function (req, res) {
    console.log('POST /auth/resentToken');

    AuthManager.resendVerifyToken(req)
      .then((result) => {
        res.send('Done');
      })
      .catch((err) => {
        console.log('Reject', err);
        res.send(err);
      });
  });
};
