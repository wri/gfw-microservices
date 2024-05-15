import config from '../../../config/config';
const { compiledAssets } = config;

/**
 * @summary
 * @name exports.diagnosticsRenderer
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */

export const diagnosticsRenderer = (req, res) => {
  res.render('diagnostics', {
    common: compiledAssets.js.common,
    compiledJs: compiledAssets.js.diagnostics,
    compiledCss: compiledAssets.css.diagnostics,
  });
};
