const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));

/**
 * @function change
 * @summary
 * @name exports.change
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.change = (req, res) => {
  const userEmail = UserManager.getUserEmail(req);
  res.render('change', {
    userEmail: userEmail,
    common: compiledAssets.js.common,
    changejs: compiledAssets.js.change,
    changecss: compiledAssets.css.change,
  });
};
