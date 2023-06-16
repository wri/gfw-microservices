/**
 *******************************************************************
 *   @name: sqlQueries.utils.js
 *   @description : Returns SQL query strings using identifiers that used to be stored procedures
 */

const ProSQLRepo = require('../../queries');
const queryMap = {};

// Helper to address the database verification to the right function
const verifyDB = (connectConfig, isSystemVerification) => {
  if (isSystemVerification) {
    return verifySystemDB(connectConfig);
  } else {
    return verifyOrgDB(connectConfig);
  }
};

const createQueryMap = (queryRepository, isSystem) => {
  Object.keys(queryRepository).forEach((queryName) => {
    queryMap[queryName] = (connectConfig) => {
      verifyDB(connectConfig, isSystem);
      return queryRepository[queryName];
    };
  });
};

function startup() {
  createQueryMap(ProSQLRepo.System, true);
  createQueryMap(ProSQLRepo.Organization, false);
}

startup();

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
  // Removing prefixes for stored procedures and lowercasing first letter
  const cleanQueryName = queryName.replace('uspG', 'g').replace('uspS', 's');

  if (queryMap[cleanQueryName]) {
    return queryMap[cleanQueryName];
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
