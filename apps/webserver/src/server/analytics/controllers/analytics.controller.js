const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));

/**
 * @function analytics
 * @summary
 * @name exports.analytics
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.analytics = (req, res) => {
  res.render('analytics', {
    common: compiledAssets.js.common,
    analyticsjs: compiledAssets.js.analytics,
    analyticscss: compiledAssets.css.analytics,
  });
};
