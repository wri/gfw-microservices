const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));

/**
 * @function manager
 * @summary
 * @name exports.manager
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.manager = (req, res) => {
  res.render('manager', {
    common: compiledAssets.js.common,
    managerjs: compiledAssets.js.manager,
    managercss: compiledAssets.css.manager,
  });
};
