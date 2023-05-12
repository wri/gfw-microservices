const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));

/**
 * @function forgot
 * @summary
 * @name exports.forgot
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.forgot = (req, res) => {
  res.render('forgot', {
    common: compiledAssets.js.common,
    forgotjs: compiledAssets.js.forgot,
    forgotcss: compiledAssets.css.forgot,
  });
};
