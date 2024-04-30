const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));

/**
 * @function reset
 * @summary
 * @name exports.reset
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
exports.reset = (req, res) => {
  res.render('reset', {
    common: compiledAssets.js.common,
    resetjs: compiledAssets.js.reset,
    resetcss: compiledAssets.css.reset,
  });
};
