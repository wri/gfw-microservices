const path = require('path');
const { compiledAssets } = require(path.resolve('./config/config'));
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const GFWlistManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
const AuthManager = require(path.resolve('./config/publicutils/authenticationManager.utils'));
const { createElement } = require('react');
const { renderToString } = require('react-dom/server');
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const ShareManager = require('../../../config/publicutils/shareManager.utils');

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
    ListManager.getUserListsWithAnalysisId(req),
    ListManager.getLocationsCount(req),
    GFWlistManager.getGFWLists(req),
    AuthManager.getUserInfo(req),
    ShareManager.getSharedListDataByUserWithAnalysisStatus(req, req.session.organization_user_id),
  ];

  Promise.all(promises)
    .then((results) => {
      const [userLists, locationCount, gfwLists, userInfo, userSharedLists] = results;
      const listStatuses = UserManager.getStatuses();

      const filteredUserList = removeUnusedKeysFromUserList(userLists);

      res.render('map', {
        userLists: filteredUserList,
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

const removeUnusedKeysFromUserList = (userList) => {
  const usedKeys = [
    'id',
    'list_name',
    'list_status_id',
    'lock_status',
    'vlock_user_id',
    'associated_gfwlist',
    'list_locations_count',
    'user_id',
    'listAnalysesStatus',
    'vector_tiles_storage_path',
    'list_table_name',
  ];

  return userList.map((user) =>
    Object.keys(user)
      .filter((key) => usedKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = user[key];
        return obj;
      }, {})
  );
};
