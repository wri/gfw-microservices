const { compiledAssets } = require('../../../config/config');
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');

const LocationManager = require('../../../config/publicutils/locationManager.utils');
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
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.listDetails = (req, res, data) => {
  const isAdministrator = UserManager.isAdministrator(req);

  const mapData = data && data.mapData ? data.mapData : false;
  const gfwData = data && data.gfwData ? data.gfwData : false;
  const drawData = data && data.drawData ? data.drawData : false;
  const locationName = data && data.locationName ? data.locationName : '';
  const fromMap = data && data.fromMap ? data.fromMap : false;
  const subscriptionStatus = data && data.subscriptionStatus ? data.subscriptionStatus : 1;

  const promises = [
    LocationManager.getAllTemplateData(req),

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
        templateData,

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
        templateData,
        userLists,
        userSharedLists: isAdministrator ? [] : userSharedLists,
        userInfo,
        organizationId: req.session.organization_id,
        locationCount,
        gfwLists,
        usersList: isAdministrator ? usersList : [],
        common: compiledAssets.js.common,
        listDetailsjs: compiledAssets.js.listDetails,
        listDetailscss: compiledAssets.css.listDetails,
        mapData,
        gfwData,
        drawData,
        locationName,
        fromMap,
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
