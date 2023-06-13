/**
 *******************************************************************
 *   @name: sqlQueries.utils.js
 *   @description : Returns SQL query strings using identifiers that used to be stored procedures
 */

const ProSQLRepo = require('../../queries');
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

  if (ProSQLRepo.System[cleanQueryName]) {
    return (connectConfig) => {
      verifySystemDB(connectConfig);
      return ProSQLRepo.System[cleanQueryName];
    };
  }

  if (ProSQLRepo.Organization[cleanQueryName]) {
    return (connectConfig) => {
      verifyOrgDB(connectConfig);
      return ProSQLRepo.Organization[cleanQueryName];
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
