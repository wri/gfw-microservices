/**
 *******************************************************************
 *   @name: sqlQueries.utils.js
 *   @description : Returns SQL query strings using identifiers that used to be stored procedures
 */

 const libsQueries = require('../../queries');

const getQueryStr = (connectConfig, storedProcedureName) => {
  const isSystemQuery = connectConfig.database === process.env.MSSQL_DATABASE;
  return libsQueries.getQueryStr(isSystemQuery, storedProcedureName);
};

module.exports = {
  getQueryStr,
};
