const path = require('path');
const controller = require('../controllers/forgot.controller');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));

/**
 * @name exports
 * @static
 * @summary Analytics page routes
 */
module.exports = (app) => {
  /**
   * @name /forgot
   * @see forgot.controller
   * @memberof Router
   */
  app.get('/forgot', controller.forgot);

  app.post('/auth/forgot', (req, res) => {
    const { email } = req.body;

    AuthManager.requestPasswordReset(req, email)
      .then((result) => {
        if (result === 8) {
          res.json({ message: 'Resend' });
        } else {
          res.json({ message: 'Success' });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  });

  app.post('/auth/admin-reset-user-password', (req, res) => {
    const { email } = req.body;

    AuthManager.adminResetUserPassword(req, email)
      .then((result) => res.json({ message: 'Success' }))
      .catch((err) => {
        res.json(err);
      });
  });
};
