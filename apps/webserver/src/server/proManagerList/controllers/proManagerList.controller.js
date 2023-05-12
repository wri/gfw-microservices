const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const ProManager = require(path.resolve('./config/publicutils/proManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
/**
 * @function proManagerList
 * @summary
 * @name exports.proManagerList
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.proManagerList = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const commoditiesData = UserManager.getCommodities(req);
  const geographiesData = UserManager.getGeographies(req);
  const titlesData = UserManager.getTitles(req);
  const accessData = UserManager.getAccessLevels(req);
  const statusData = UserManager.getStatuses(req);

  const promises = [
    ProManager.getAllAccountsList(req),
    ProManager.getAllUsersList(req),
    PolicyManager.getPendingPolicyList(req),
    PolicyManager.getAllPolicyList(req),
  ];

  Promise.all(promises)
    .then((results) => {
      const policyList = results[2].concat(results[3]);
      res.render('proManagerList', {
        common: compiledAssets.js.common,
        accounts: results[0],
        users: results[1],
        classes: classes,
        commoditiesData: commoditiesData,
        geographiesData: geographiesData,
        titlesData: titlesData,
        statusData: statusData,
        accessData: accessData,
        policyList: policyList,
        proManagerListjs: compiledAssets.js.proManagerList,
        proManagerListcss: compiledAssets.css.proManagerList,
      });
    })
    .catch((error) => {
      console.log('Pro-manager-list page failed on the server:', error);
      res.render('admin', {
        common: compiledAssets.js.common,
        adminjs: compiledAssets.js.admin,
      });
    });
};
