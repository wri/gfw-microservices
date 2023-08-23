const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));

/**
 * @summary
 * @name exports.diagnosticsRenderer
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */

exports.diagnosticsRenderer = (req, res) => {
  res.render('diagnostics', {
    common: compiledAssets.js.common,
    compiledJs: compiledAssets.js.diagnostics,
    compiledCss: compiledAssets.css.diagnostics,
  });
};
