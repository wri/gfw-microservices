const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));

/**
 * @function changeExist
 * @summary
 * @name exports.changeExist
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.changeExist = (req, res) => {
  const userEmail = UserManager.getUserEmail(req);
  res.render('changeExist', {
    userEmail: userEmail,
    common: compiledAssets.js.common,
    changeExistjs: compiledAssets.js.changeExist,
    changeExistcss: compiledAssets.css.changeExist,
  });
};
