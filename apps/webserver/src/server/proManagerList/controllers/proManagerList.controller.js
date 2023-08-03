const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const ProManager = require(path.resolve('./config/publicutils/proManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
const AnalysisLimitsService = require(path.resolve('./server/analytics/service/analytics.service'));
/**
 * @function proManagerList
 * @summary
 * @name exports.proManagerList
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */

exports.proManagerList = (req, res) => {
  res.render('proManagerList', {
    common: compiledAssets.js.common,
    proManagerListjs: compiledAssets.js.proManagerList,
    proManagerListcss: compiledAssets.css.proManagerList,
  });
};

const getUserFromQuery = (userId, organizationId, accounts, users) => {
  const selectedUser = users.find(
    (user) => user.user_id === userId && user.organization_id === organizationId
  );
  if (selectedUser) {
    const selectedOrganization = accounts.find(
      (account) => account.organization_id === organizationId
    );
    selectedUser.org_status = selectedOrganization.organization_status_id;
  }

  return selectedUser || null;
};

const getAccounFromQuery = (organizationName, organizationId, accounts) => {
  const selectedAccount = accounts.find(
    (account) =>
      account.organization_id === organizationId && account.organization_name === organizationName
  );
  return selectedAccount || null;
};

exports.proManagerListAccountsData = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const statusData = UserManager.getStatuses(req);

  const promises = [ProManager.getAllAccountsList(req)];

  Promise.all(promises)
    .then(([accounts]) => {
      res.status(200).json({
        accounts,
        classes,
        statusData,
      });
    })
    .catch((error) => {
      console.log('Pro-manager-list page failed on the server:', error);
      res.status(500).send(error);
    });
};

exports.proManagerListAccountDetailData = async (req, res) => {
  const { organizationId: organizationIdParam, organizationName } = req.params;

  const organizationId = parseInt(organizationIdParam, 10);
  const classes = AccountManager.getClassifications(req);
  const accessData = UserManager.getAccessLevels(req);
  const statusData = UserManager.getStatuses(req);

  const promises = [
    ProManager.getAllAccountsList(req),
    ProManager.getAllUsersList(req),
    PolicyManager.getPendingPolicyList(req),
    PolicyManager.getAllPolicyList(req),
    AnalysisLimitsService.getAnalysisLimitData({}),
  ];

  try {
    const [accounts, users, pendingPolicy, allPolicy, accountsLimits] = await Promise.all(promises);

    const policyList = pendingPolicy.concat(allPolicy);
    let selectedAccount = getAccounFromQuery(organizationName, organizationId, accounts, users);

    /**
     * @note
     * If the account is not PENDING(=1), attach an analysis_limits property based on the OrgID or OrgType (subscription_status)
     * Otherwise the object should be null.
     * @see GPV-1950
     */
    selectedAccount.analysis_limits =
      selectedAccount.organization_status_id !== 1
        ? accountsLimits.find((limit) => limit.OrgID === selectedAccount.organization_id) ||
          accountsLimits.find((limit) => limit.OrgType === selectedAccount.subscription_status_id)
        : null;

    res.status(200).json({
      users,
      classes,
      statusData,
      accessData,
      policyList,
      selectedAccount,
    });
  } catch (error) {
    console.log('Pro-manager-list account-detail page failed on the server:', error);
    res.status(500).send(error);
  }
};

exports.proManagerListUsersData = (req, res) => {
  const accessData = UserManager.getAccessLevels(req);
  const statusData = UserManager.getStatuses(req);

  const promises = [ProManager.getAllUsersList(req)];

  Promise.all(promises)
    .then(([users]) => {
      res.status(200).json({
        users,
        statusData,
        accessData,
      });
    })
    .catch((error) => {
      console.log('Pro-manager-list page failed on the server:', error);
      res.status(500).send(error);
    });
};

exports.proManagerListUserDetailData = (req, res) => {
  const classes = AccountManager.getClassifications(req);
  const commoditiesData = UserManager.getCommodities(req);
  const geographiesData = UserManager.getGeographies(req);
  const titlesData = UserManager.getTitles(req);
  const { userId: userIdQuery, organizationId: organizationIdQuery } = req.params;

  const userId = parseInt(userIdQuery, 10);
  const organizationId = parseInt(organizationIdQuery, 10);

  const promises = [ProManager.getAllAccountsList(req), ProManager.getAllUsersList(req)];

  Promise.all(promises)
    .then(([accounts, users]) => {
      const selectedUser = getUserFromQuery(userId, organizationId, accounts, users);

      res.status(200).json({
        classes,
        commoditiesData,
        geographiesData,
        titlesData,
        selectedUser,
      });
    })
    .catch((error) => {
      console.log('Pro-manager-list page failed on the server:', error);
      res.status(500).send(error);
    });
};
