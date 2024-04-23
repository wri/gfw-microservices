const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));

/**
 * @function account
 * @summary
 * @name exports.account
 * @static
 * @param {Express.Request} req - Express request object
 * @param res - Express response object
 */
exports.account = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const commoditiesData = UserManager.getCommodities(req);
  const geographiesData = UserManager.getGeographies(req);
  const titlesData = UserManager.getTitles(req);
  res.render('account', {
    classifications: classes,
    commodities: commoditiesData,
    geographies: geographiesData,
    titles: titlesData,
    common: compiledAssets.js.common,
    accountjs: compiledAssets.js.account,
    accountcss: compiledAssets.css.account,
  });
};
