const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const GFWlistManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const ShareManager = require('../../../config/publicutils/shareManager.utils');
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const { findSharedListsInsideOrganization } = require('../../../config/publicutils/shareManager.utils');
const LocationManager = require(path.resolve('./config/publicutils/locationManager.utils'));

/**
 * @function dashboard
 * @summary
 * @name exports.dashboard
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.dashboard = (req, res, data) => {
  const isAdministrator = UserManager.isAdministrator(req);
  const { session } = req;
  const fromMap = data ? true : false;

  const promises = [
    ListManager.getUserLists(req),
    ListManager.getLocationsCount(req),
    GFWlistManager.getGFWLists(req),
    ListManager.getAllLists(req),
    ShareManager.getUserInternalShareLists(req, req.session.organization_user_id),
    LocationManager.getListStatuses(req),
    AuthManager.getUserInfo(req),
  ];

  Promise.all(promises)
    .then((results) => {
      const [userLists, locationCount, gfwLists, orgLists, sharedListsRecords, listStatuses, userInfo] = results;
      // Filter out Protected Areas and Administrative Areas
      const filteredGFWLists = gfwLists.filter(
        (list) => list.list_name !== 'Administrative Areas' && list.list_name !== 'Protected Areas'
      );

      const userSharedLists = findSharedListsInsideOrganization(sharedListsRecords, orgLists);
      res.render('dashboard', {
        userLists,
        locationCount,
        gfwLists: filteredGFWLists,
        accessLevel: session.user_access_level_id,
        subscription_status_id: session.subscription_status_id,
        common: compiledAssets.js.common,
        dashboardjs: compiledAssets.js.dashboard,
        dashboardcss: compiledAssets.css.dashboard,
        userSharedLists: isAdministrator ? [] : userSharedLists,
        fromMap: fromMap,
        listStatuses: listStatuses,
        userInfo: userInfo,
      });
    })
    .catch((error) => {
      console.log('Failed to render Dashboard page');
    });
};
