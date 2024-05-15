import config from '../../../config/config';
const { compiledAssets } = config;

/**
 * @function manager
 * @summary
 * @name exports.manager
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
export const manager = (req, res) => {
  res.render('manager', {
    common: compiledAssets.js.common,
    managerjs: compiledAssets.js.manager,
    managercss: compiledAssets.css.manager,
  });
};
