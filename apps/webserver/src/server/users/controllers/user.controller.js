const path = require('path');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));

/**
 * @function signout
 * @summary sign the user out
 * @name exports.signout
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
exports.signout = (req, res) => {
  // req.logout();
  AuthManager.logout(req);
  res.clearCookie('gfwpro.globalforestwatch.org');
  res.redirect('/');
};
