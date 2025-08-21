import config from '../../../config/config';
const { compiledAssets } = config;
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');

const ListManager = require('../../../config/publicutils/listManager.utils');
const GFWlistManager = require('../../../config/publicutils/gfwListManager.utils');
const AuthManager = require('../../../config/publicutils/authenticationManager.utils');
const AccountManager = require('../../../config/publicutils/accountManager.utils');
const UserManager = require('../../../config/publicutils/userManager.utils');
const ShareManager = require('../../../config/publicutils/shareManager.utils');
const {
  findSharedListsInsideOrganization,
} = require('../../../config/publicutils/shareManager.utils');

// Logging
const logger = require('../../../config/privateutils/logger.utils');

/**
 * @function listDetails
 * @summary
 * @name exports.listDetails
 * @static
 * @param req - Express request object
 * @param res - Express response object
 */
export const listDetails = (req, res) => {
  const isAdministrator = UserManager.isAdministrator(req);
  const subscriptionStatus = req.session?.subscription_status_id ?? 1;

  const promises = [
    ListManager.getUserListsWithAnalysisId(req),
    AuthManager.getUserInfo(req),
    ListManager.getLocationsCount(req),
    ListManager.getAllListsWithAnalysisId(req),
    GFWlistManager.getGFWLists(req),
    AccountManager.getUsersList(req),
    ShareManager.getUserInternalShareLists(req, req.session.organization_user_id),
  ];

  Promise.all(promises)
    .then((results) => {
      const [
        userLists,
        userInfo,
        locationCount,
        orgLists,
        gfwLists,
        usersList,
        sharedListsRecords,
      ] = results;
      const listStatuses = UserManager.getStatuses();
      const userSharedLists = findSharedListsInsideOrganization(sharedListsRecords, orgLists);
      res.render('listDetails', {
        userLists,
        userSharedLists: isAdministrator ? [] : userSharedLists,
        userInfo,
        locationCount,
        gfwLists,
        usersList: isAdministrator ? usersList : [],
        common: compiledAssets.js.common,
        listDetailsjs: compiledAssets.js.listDetails,
        listDetailscss: compiledAssets.css.listDetails,
        listStatuses,
        CURRENT_ENVIRONMENT: process.env.NODE_ENV,
        subscriptionStatus,
      });
    })
    .catch((err) => {
      logger.error(`listDetails page failed on the server:, ${err}`);
      const markup = compiledAssets.js['login-component']
        ? renderToString(createElement(compiledAssets.js['login-component'].default))
        : '';
      console.log('listDetails page failed on the server:', err);
      res.render('login', {
        critical: compiledAssets.css['login/css/login.scss'],
        common: compiledAssets.js.common,
        loginjs: compiledAssets.js.login,
        markup,
      });
    });
};
