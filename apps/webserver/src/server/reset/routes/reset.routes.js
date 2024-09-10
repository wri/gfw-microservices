const path = require('path');
const controller = require('../controllers/reset.controller');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
import * as logger from '../../../config/privateutils/logger.utils';

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app) => {
  /**
   * @name /reset
   * @see reset.controller
   * @memberof Router
   */
  app.get('/reset', controller.reset);

  app.post('/reset/verify', (req, res) => {
    console.log('POST /reset/verify');
    const { verifyCode, newPwd, email } = req.body;
    AuthManager.confirmPasswordReset(req, verifyCode, newPwd, email)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        logger.error(`POST /reset/verify`, err);
        res.send('Account signup failed');
      });
  });
};
