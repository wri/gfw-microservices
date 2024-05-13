import config from '../../../config/config';
const { compiledAssets } = config;

/**
 * @function forgot
 * @summary
 * @name exports.forgot
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
exports.forgot = (req, res) => {
  res.render('forgot', {
    common: compiledAssets.js.common,
    forgotjs: compiledAssets.js.forgot,
    forgotcss: compiledAssets.css.forgot,
  });
};
