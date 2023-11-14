// const path = require('path');
const path = require('path');
const controller = require('../controllers/admin.controller');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app) => {
  /**
   * @name /admin
   * @see admin.controller
   * @memberof Router
   */
  app.get('/pro-manager', controller.admin);

  app.post('/auth/signinAdmin', (req, res) => {
    const { username, password } = req.body;

    /**
     * @property authenticationStatus - Status as result of Cognito Authentication
     *  1 - Authenticated
     *  2 - Unauthenticated or invalid username/password
     *  3 - RequireNewPassword; user's initial login with default password
     *  4 - ConfirmPassword; User forgot password and requested a reset, has verification code
     *  5 - Disabled; user is disabled not just unauthenticated, for inactive users
     */
    AuthManager.login(req, username, password, true)
      .then((result) => {
        const { authenticationStatus } = result;
        if (authenticationStatus === 1) {
          res.send('Authenticated');
        } else if (authenticationStatus === 2) {
          res.send('Unauthenticated');
        } else if (authenticationStatus === 3) {
          res.send('RequireNewPassword');
        } else if (authenticationStatus === 4) {
          res.send('ConfirmPassword');
        } else if (authenticationStatus === 5) {
          res.send('Disabled');
        } else {
          res.send('Login error');
        }
      })
      .catch((err) => {
        res.send('Login error');
      });
  });
};
