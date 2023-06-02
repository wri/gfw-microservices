/**
 *******************************************************************
 *   @name: sqlQueries.utils.js
 *   @description : Returns SQL query strings using identifiers that used to be stored procedures
 */

/**
 * TODO: Cleanups
 * 1) Delete tables gfwpro.ActivityType and gfwpro.ActivityTypeCategory (DB and CreateGFWProDB.sql)
 *    a) Delete stored procedures: uspGetActivityTypesQuery
 *    b) Update stored procedures: gfwpro.uspActivatePendingAccount,
 *       clientstore.uspActivatePendingAccount to remove creation of stored procedure
 * 2) Delete table gfwpro.[Classifications] (DB and CreateGFWProDB.sql)
 *    a) Delete stored procedure uspGetClassifications
 * 3) Delete table gfwpro.[AccessLevels] (DB and CreateGFWProDB.sql)
 *    a) Delete stored procedure uspGetAccessLevels
 *    b) Update stored procedures uspGetAllUsersList to remove unused @access_level
 *    c) Update AlterGFWProDB.sql to remove unused @access_level
 * 4) Delete table gfwpro.[Commodities] (DB and CreateGFWProDB.sql)
 *    a) Delete stored procedure uspGetCommodities
 * 5) Delete table gfwpro.[Titles] (DB and CreateGFWProDB.sql)
 *    a) Delete stored procedure uspGetTitles
 * 6) Delete table gfwpro.[Geographiesles] (DB and CreateGFWProDB.sql)
 *    a) Delete stored procedure uspGetGeographies
 * 7) Delete table gfwpro.[Statuses] (DB and CreateGFWProDB.sql)
 *    a) Delete stored procedure uspGetStatuses
 *    b) Update stored procedures uspGetAllUsersList to remove unused @status_level
 *    c) Update AlterGFWProDB.sql to remove unused @status_level
 *
 * N) Remove stored procedures for everything in this file (DB and CreateGFWProDB.sql)
 */

const x = require('x');

// Verify given connection is for system (gfwpro) DB
const verifySystemDB = (connectConfig) => {
  if (connectConfig.database !== process.env.MSSQL_DATABASE) {
    throw new Error(`verifySystemDB failed ${connectConfig.database}`);
  }
};

// Verify given connection is not for system (gfwpro) DB, but for organization (clientstore-<xxx>) DB
const verifyOrgDB = (connectConfig) => {
  if (connectConfig.database === process.env.MSSQL_DATABASE) {
    throw new Error(`verifyOrgDB failed ${connectConfig.database}`);
  }
};

/**
 * System (gfwpro) DB queries below this line just to keep them separate and easier to find
 * ----------------------------------------------------------------------------------------
 */
const uspGetClassificationsQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getClassifications;
};

const uspGetAccessLevelsQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getAccessLevels;
};

const uspGetCommoditiesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getCommodities;
};

const uspGetTitlesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getTitles;
};

const uspGetAdministrativeAreasInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getAdministrativeAreasInfo;
};

const uspGetStatusesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getStatuses;
};

const uspGetGeographiesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getGeographies;
};

const uspGetProtectedAreasInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getProtectedAreasInfo;
};

const uspGetInitialUserRouteInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getInitialUserRouteInfo;
};

const uspGetGFWProRootUserInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getGFWProRootUserInfo;
};

const uspGetVerifiedUserRouteInfoQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getVerifiedUserRouteInfo;
};

const uspGetOrganizationStatusQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getOrganizationStatus;
};

const uspGetTemplateMetadataQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getTemplateMetadata;
};

const uspGetTemplatesDropdownQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getTemplatesDropdown;
};

const uspGetUserAuthenticationPreferencesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getUserAuthenticationPreferences;
};

const uspGetUsersAuthenticationPreferencesQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getUsersAuthenticationPreferences;
};

const uspGetLocationsCountQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getLocationsCount;
};

const uspGetGfwListsQuery = (connectConfig) => {
  verifySystemDB(connectConfig);
  return x.getGfwLists;
};

/**
 * Organization queries below this line just to keep them separate and easier to find
 * ----------------------------------------------------------------------------------
 */

const uspSetActivityLogQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.setActivityLog;
};

const uspGetUserInfoQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.getUserInfo;
};

const uspGetUserStatusQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.getUserStatus;
};

const uspGetAllListsQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.getAllLists;
};

const uspGetUsersListQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.getUsersList;
};

const uspGetUserInternalShareListsQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.getUserInternalShareLists;
};

const uspGetFoldersQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.getFolders;
};

const uspGetAllFolderItemsQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  return x.getAllFolderItems;
};

const uspGetActivityLogQuery = (connectConfig) => {
  verifyOrgDB(connectConfig);
  // limit to most recent 10K elements because the UI is not responsive beyond that
  return x.getActivityLog;
};

const convertedStoredProcedures = {
  // systemDB
  uspGetAdministrativeAreasInfo: uspGetAdministrativeAreasInfoQuery,
  uspGetProtectedAreasInfo: uspGetProtectedAreasInfoQuery,
  uspGetInitialUserRouteInfo: uspGetInitialUserRouteInfoQuery,
  uspGetGFWProRootUserInfo: uspGetGFWProRootUserInfoQuery,
  uspGetVerifiedUserRouteInfo: uspGetVerifiedUserRouteInfoQuery,
  uspGetOrganizationStatus: uspGetOrganizationStatusQuery,
  uspGetTemplateMetadata: uspGetTemplateMetadataQuery,
  uspGetTemplatesDropdown: uspGetTemplatesDropdownQuery,
  uspGetUserAuthenticationPreferences: uspGetUserAuthenticationPreferencesQuery,
  uspGetUsersAuthenticationPreferences: uspGetUsersAuthenticationPreferencesQuery,
  uspGetLocationsCount: uspGetLocationsCountQuery,
  uspGetGfwLists: uspGetGfwListsQuery,

  // orgDB
  uspSetActivityLog: uspSetActivityLogQuery,
  uspGetUserInfo: uspGetUserInfoQuery,
  uspGetUserStatus: uspGetUserStatusQuery,
  uspGetAllLists: uspGetAllListsQuery,
  uspGetUsersList: uspGetUsersListQuery,
  uspGetUserInternalShareLists: uspGetUserInternalShareListsQuery,
  uspGetFolders: uspGetFoldersQuery,
  uspGetAllFolderItems: uspGetAllFolderItemsQuery,
  uspGetActivityLog: uspGetActivityLogQuery,
};

const getQueryStr = (connectConfig, storedProcedureName) => {
  const queryFn = convertedStoredProcedures[storedProcedureName];
  if (queryFn) {
    return queryFn(connectConfig);
  }
  return null;
};

module.exports = {
  getQueryStr,
};
