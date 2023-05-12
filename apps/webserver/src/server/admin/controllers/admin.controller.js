const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));

/**
 * @function admin
 * @summary
 * @name exports.admin
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.admin = (req, res) => {
  res.render('admin', {
    common: compiledAssets.js.common,
    adminjs: compiledAssets.js.admin,
    admincss: compiledAssets.css.admin,
  });
};
