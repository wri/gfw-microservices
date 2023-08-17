const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const GFWlistManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const ShareManager = require('../../../config/publicutils/shareManager.utils');
const {
  findSharedListsInsideOrganization,
} = require('../../../config/publicutils/shareManager.utils');

/**
 * @function map
 * @summary
 * @name exports.map
 * @static
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 */
exports.map = (req, res) => {
  // Set in the response to not cache the page
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');

  const isAdministrator = UserManager.isAdministrator(req);
  const listData = req?.body?.data || {};

  const promises = [
    ListManager.getUserLists(req),
    ListManager.getLocationsCount(req),
    GFWlistManager.getGFWLists(req),
    AuthManager.getUserInfo(req),
    ListManager.getAllLists(req),
    ShareManager.getUserInternalShareLists(req, req.session.organization_user_id),
  ];

  Promise.all(promises)
    .then((results) => {
      const [userLists, locationCount, gfwLists, userInfo, orgLists, sharedListsRecords] = results;
      const listStatuses = UserManager.getStatuses();

      const userSharedLists = findSharedListsInsideOrganization(sharedListsRecords, orgLists);
      res.render('map', {
        userLists,
        locationCount,
        gfwLists,
        userInfo,
        listData,
        mapjs: compiledAssets.js.map,
        mapcss: compiledAssets.css.map,
        userSharedLists: isAdministrator ? [] : userSharedLists,
        listStatuses,
        CURRENT_ENVIRONMENT: process.env.NODE_ENV,
      });
    })
    .catch((error) => {
      const markup = compiledAssets.js['login-component']
        ? renderToString(createElement(compiledAssets.js['login-component'].default))
        : '';
      console.log('Locations page failed on the server:', error);
      res.render('login', {
        critical: compiledAssets.css['login/css/login.scss'],
        common: compiledAssets.js.common,
        loginjs: compiledAssets.js.login,
        markup: markup,
      });
    });
};
