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

const ProSQLRepo = require('@wri-monorepos/sql');
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

const returnQueryClosure = (queryName) => {
  const cleanQueryName = queryName.replace('uspG', 'g').replace('uspS', 's');

  if (ProSQLRepo.RAWQuery.System[cleanQueryName]) {
    return (connectConfig) => {
      verifySystemDB(connectConfig);
      return ProSQLRepo.RAWQuery.System[cleanQueryName];
    };
  }

  if (ProSQLRepo.RAWQuery.Organization[cleanQueryName]) {
    return (connectConfig) => {
      verifyOrgDB(connectConfig);
      return ProSQLRepo.RAWQuery.System[cleanQueryName];
    };
  }

  return null;
};

const getQueryStr = (connectConfig, storedProcedureName) => {
  const queryFn = returnQueryClosure(storedProcedureName);
  if (queryFn) {
    return queryFn(connectConfig);
  }
  return null;
};

module.exports = {
  getQueryStr,
};
