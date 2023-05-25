/**
 *******************************************************************
 *   @name: sql.utils.js
 *   @description : A utility file to allow calling stored procedures
 *                 on databases. Used to get data from both the
 *                 main GFW databases, but also the organizations
 *                 database.
 *   @function {executeSystemStoredProcedure}
 *   @function {executeOrganizationStoredProcedure}
 *   @function {executeOrganizationBulkUpload}
 *   @function {getDataType}
 *
 *******************************************************************
 */
// Imports required for this module.
const sql = require('mssql');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const logger = require('winston');
const config = require('../config');
const sqlQueries = require('./sqlQueries.utils');

// Common configuration for creating database connections
const SQLSYSTEMCONFIG = {
  server: config.SQLConnection.host,
  port: parseInt(config.SQLConnection.port, 10),
  database: config.SQLConnection.database,
  user: config.SQLConnection.username,
  password: config.SQLConnection.password,
  requestTimeout: 90000,
  options: {
    encrypt: false,
  },
};

// cache of DB pools to improve performance
// This object is a map from database name to connected pool object
// For test environments, it also contains the sqliteDB
const cachedPools = {};

/**
 * Close pool and remove from cache.  This is called on errors so next attempt will recreate pool
 * @param {Object} connectConfig - configuration for sql connection
 */
const removePool = (connectConfig) => {
  if (cachedPools[connectConfig.database]) {
    cachedPools[connectConfig.database].close();
  }
  delete cachedPools[connectConfig.database];
};

/**
 * Get cached database connection pool for given database configuration
 * @param {Object} connectConfig - configuration for sql connection
 * @returns {Promise<Object>} Promise for a cached pool
 */
const getPool = async (connectConfig) => {
  try {
    // 'test' envs use sqlite
    if (process.env.NODE_ENV === 'test') {
      if (!cachedPools.sqliteDB) {
        const filename = ':memory:';
        const newSqlite = await sqlite.open({ filename, driver: sqlite3.Database });
        // recheck in case someone else beat us to creating sqlite DB
        if (!cachedPools.sqliteDB) {
          cachedPools.sqliteDB = newSqlite;
        }
      }
      return cachedPools.sqliteDB;
    }
    // not 'test' env -- use mssql
    if (!connectConfig.database) {
      throw new Error('Error: SQL getPool no database specified');
    }
    if (!cachedPools[connectConfig.database]) {
      // Create a SQL Connection and add to the cached pools
      const poolPreConnect = new sql.ConnectionPool(connectConfig);
      const poolConnected = await poolPreConnect.connect();
      poolConnected.on('error', (err) => {
        logger.error('SQL Pool Error:', connectConfig.database, err);
        // recreate connection on errors
        removePool(connectConfig);
        // ignore any new errors while creating new connection
        getPool(connectConfig).catch(() => {
          logger.error('Ignoring secondary getPool error during error handling');
        });
      });
      // check if someone else beat us to creating new pool for this DB
      if (!cachedPools[connectConfig.database]) {
        cachedPools[connectConfig.database] = poolConnected;
      } else {
        poolConnected.close();
      }
    }
    return cachedPools[connectConfig.database];
  } catch (err) {
    logger.error('Error: sql getPool ', err);
    throw err;
  }
};

/**
 * Replace the given regex (with a capture pattern) in given inputStr and optionally
 * replace the matched string with `newCmd(capture)`
 */
const regexReplaceCmd = (inputStr, regex, newCmd) => {
  let updatedStr = inputStr;
  let matchInfo;
  // eslint-disable-next-line no-cond-assign
  while ((matchInfo = regex.exec(updatedStr)) !== null) {
    const replacementStr = newCmd ? `${newCmd}(${matchInfo[1]})` : matchInfo[1];
    updatedStr = updatedStr.replace(matchInfo[0], replacementStr);
  }
  return updatedStr;
};

// convert SQL statements from MS SQL server syntax to SQLite syntax
const mssql2sqliteQuery = (mssqlQuery) => {
  let updatedQuery = mssqlQuery;
  updatedQuery = regexReplaceCmd(updatedQuery, /CONVERT\(VARCHAR\(\d+\),\s*(\w+)\)/g);
  updatedQuery = regexReplaceCmd(updatedQuery, /STRING_AGG\((\w+), ','\)/g, 'group_concat');
  // 'TOP (n)' should be replaced with LIMIT n, but large results unlikely in test, so ignoring for now
  updatedQuery = updatedQuery.replaceAll(/TOP\s*\(\d+\)/g, '');
  return updatedQuery;
};

// Replace MS SQL server syntax style query with '@variable' with values from params
const sqliteApplyParams = (databaseName, baseQuery, params = []) => {
  if (baseQuery.includes('Analyses-Dashboard')) {
    // let queryStr = baseQuery.replace('Analyses-Dashboard', `${databaseName}Analyses-Dashboard`);
    // Add databasename prefix (clientstore-xxx) to Analyses-Dashboard because the same name
    // is used in both gfwpro and clientstore DBs.  TODO:  Needs further special handling
    // in uspActivatePendingAccount to reach the right table.
    throw new Error('sql.utils: Not implemented: Analyses-Dashboard');
  }
  let queryStr = baseQuery;
  params.forEach((paramInfo) => {
    const paramValue = paramInfo.value;
    if (typeof paramValue === 'string') {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, `'${paramValue}'`);
    } else if (paramValue instanceof Date) {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, `'${paramValue.toISOString()}'`);
    } else if (typeof paramValue === 'object') {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, `'${paramValue.toString()}'`);
    } else {
      queryStr = queryStr.replaceAll(`@${paramInfo.field}`, paramValue);
    }
  });
  return queryStr;
};

/**
 * Query SQLite DB with given MS SQL server style syntax query and params
 * 1) converts the query string from MS SQL server to sqlite syntax
 * 2) applies SQL server style query params to the update sqlite query string
 * 3) If the given query is supported, send it to SQLite, otherwise return empty results
 * @param {Object} sqliteDB - SQLite DB instance
 * @param {Object} connectConfig - configuration for sql connection
 * @param {String} mssqlQuery - MS SQL server syntax query string
 * @param {String} namedQuery - name of query
 * @param {Array} params - MS SQL server style parameter list
 * @returns Promise with data returned by SQLite
 */
const sqliteQuery = async (sqliteDB, connectConfig, mssqlQuery, namedQuery, params) => {
  let queryStr;
  try {
    const baseQuery = mssql2sqliteQuery(mssqlQuery);
    queryStr = sqliteApplyParams(connectConfig.database, baseQuery, params);
    // temporary debug log
    console.log('sqlite query string', queryStr);
    const result = await sqliteDB.all(queryStr);
    return [result];
  } catch (err) {
    logger.error('sqliteQuery failed ', namedQuery, queryStr || mssqlQuery, err);
    throw err;
  }
};

/**
 * Execute given query or stored procedure with given DB config
 * @param {number} triesLeft - number of attemps left (case of errors)
 * @param {Object} connectConfig - configuration for sql connection
 * @param {String} queryStrParam - SQL query string or null
 * @param {String} storedProcedureName - name of the stored procedure to execute or null
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @returns Promise with data returned by given stored proedure
 */
const mssqlExecuteWithRetries = async (triesLeft, connectConfig, queryStrParam, storedProcedureName, params) => {
  try {
    if (queryStrParam && storedProcedureName) {
      throw new Error('Both query and stored procedure specified');
    }

    let baseQuery;
    // Some stored procedures have been converted to queries using storedProcedureName as the query identifier
    // Check for those before issue query instead of the stored procedure for those.
    if (queryStrParam) {
      baseQuery = queryStrParam;
    } else {
      baseQuery = sqlQueries.getQueryStr(connectConfig, storedProcedureName);
    }

    const pool = await getPool(connectConfig);
    if (cachedPools.sqliteDB) {
      return sqliteQuery(pool, connectConfig, baseQuery, storedProcedureName, params);
    }
    // Get Request Object. Query
    const request = new sql.Request(pool);
    // Add parameters to the request object.
    if (params && Array.isArray(params)) {
      params.forEach((param) => {
        request.input(param.field, param.type, param.value);
      });
    }

    let rawResults;
    if (baseQuery) {
      // add defaults for MSSQL
      const queryStr = `SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; ${baseQuery}`;
      rawResults = await request.query(queryStr);
    } else {
      rawResults = await request.execute(storedProcedureName);
    }
    return rawResults.recordsets;
  } catch (err) {
    logger.error('mssqlExecute failed ', triesLeft, connectConfig && connectConfig.database, storedProcedureName, queryStrParam && queryStrParam.slice(0, 100));
    logger.error(err);
    removePool(connectConfig);
    if (triesLeft > 0) {
      return mssqlExecuteWithRetries(triesLeft - 1, connectConfig, queryStrParam, storedProcedureName, params);
    }
    throw err;
  }
};

// simple wrapper that sets initial retry count to retry once after initial error
const mssqlExecute = async (connectConfig, queryStrParam, storedProcedureName, params) => {
  return mssqlExecuteWithRetries(1, connectConfig, queryStrParam, storedProcedureName, params);
};

/**
 * Executes a stored procedure for the system database and returns any records received
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} storedProcedureName - name of the stored procedure to execute.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Array} An array of record sets
 */
const executeSystemStoredProcedureAllRecords = async (req, storedProcedureName, params) => {
  return mssqlExecute(SQLSYSTEMCONFIG, null, storedProcedureName, params);
};

/**
 * @function executeSystemStoredProcedure
 * @summary Executes a stored procedure for the system database and returns
 *			any records received.
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} storedProcedureName - name of the stored procedure to execute.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Object} First entry of record sets array
 */
const executeSystemStoredProcedure = async (req, storedProcedureName, params) => {
  const recordsets = await mssqlExecute(SQLSYSTEMCONFIG, null, storedProcedureName, params);
  return recordsets[0];
};

/**
 * @function executeOrganizationStoredProcedure
 * @summary Executes a stored procedure for the particular user's database and returns
 *			any records received.
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} storedProcedureName - name of the stored procedure to execute.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Object} First entry of record sets array
 */
const executeOrganizationStoredProcedure = async (req, storedProcedureName, params) => {
  // Create SQL Connection Config based on session database.
  const connectConfig = { ...SQLSYSTEMCONFIG, database: req.session.organization_database };
  const recordsets = await mssqlExecute(connectConfig, null, storedProcedureName, params);
  return recordsets[0];
};

/**
 * @function executeOrganizationBulkUpload
 * @summary Executes a bulk insert
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} listTableName - name of the table to upload data to.
 * @param {Boolean} createTable - A boolean specifying whether to create the table if it exists or not.
 * @param {Array} columnNames - An array specifying the names of each of the columns in the table.
 * @param {Array} columnTypes - An array specifying the type of each of the columns in the table.
 * @param {Array} data - An array of arrays with each array representing a row of data.
 */
const executeOrganizationBulkUpload = async (req, listTableName, createTable, columnNames, columnTypes, data) => {
  const connectConfig = { ...SQLSYSTEMCONFIG, database: req.session.organization_database };
  // Setup the new SQL Table.
  const objTable = new sql.Table(listTableName);
  objTable.create = createTable;
  // Add all columns to the table.
  for (let nIndex = 0; nIndex < columnNames.length; nIndex += 1) {
    objTable.columns.add(columnNames[nIndex], columnTypes[nIndex], {
      nullable: true,
      primary: false,
    });
  }

  // Add all the rows to the table.
  for (let nIndex = 0; nIndex < data.length; nIndex += 1) {
    if (data[nIndex].length === columnNames.length) {
      // Add data to the sql table
      objTable.rows.add(...data[nIndex]);
    } else {
      throw new Error(
        `Length columns and properties do not match! Expected: ${columnNames.length} Received: ${data[nIndex].length}`
      );
    }
  }

  try {
    const pool = await getPool(connectConfig);
    const request = new sql.Request(pool);
    // Execute bulk insert
    await request.bulk(objTable);
  } catch (err) {
    logger.error('Executing Bulk Insert for Table ', listTableName);
    logger.error(err);
    removePool(connectConfig);
    throw err;
  }
};

/**
 * @function executeSystemQuery
 * @summary Query the systemDB
 * @param {String} sqlQuery - SQL query to be executed on the organization database.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Object} Result of the SQL query
 */
const executeSystemQuery = async (sqlQuery, params) => {
  return mssqlExecute(SQLSYSTEMCONFIG, sqlQuery, null, params);
};

/**
 * @function executeOrganizationQuery
 * @summary Query the orgDB specified in req.session
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} sqlQuery - SQL query to be executed on the organization database.
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @return {Object} Result of the SQL query
 */
const executeOrganizationQuery = async (req, sqlQuery, params) => {
  const connectConfig = { ...SQLSYSTEMCONFIG, database: req.session.organization_database };
  return mssqlExecute(connectConfig, sqlQuery, null, params);
};

/**
 * @function getDataType
 * @summary Converts text to sql data type object
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} type - the text type to convert and return
 * @return {Object} the SQL data type
 */
const getDataType = (req, type) => {
  let dataType = null;
  switch (type) {
    case 'geometry':
      // dataType = sql.Geometry;
      dataType = sql.NVarChar(sql.MAX);
      break;
    case 'int':
      dataType = sql.Int;
      break;
    case 'bigint':
      dataType = sql.BigInt;
      break;
    case 'float':
      // dataType = sql.Float;
      dataType = sql.NVarChar(150);
      break;
    case 'datetime':
      // dataType = sql.DateTime;
      dataType = sql.NVarChar(150);
      break;
    case 'smalldatetime':
      // dataType = sql.SmallDateTime;
      dataType = sql.NVarChar(150);
      break;
    case 'text':
      dataType = sql.NVarChar(sql.MAX);
      // dataType = sql.Text;
      break;
    case 'nvarchar':
      dataType = sql.NVarChar(150);
      break;
    case 'binary':
      dataType = sql.NVarChar(150);
      // dataType = sql.Binary;
      // dataType = sql.NVarChar(2);
      dataType = sql.Int;
      break;
    case 'sql_variant':
      dataType = sql.Variant;
      break;
    case 'bit':
      // dataType = sql.Bit;
      dataType = sql.NVarChar(150);
      break;
    default:
      dataType = sql.NVarChar(150);
    // dataType = {};
  }
  return dataType;
};

module.exports = {
  executeSystemStoredProcedure,
  executeOrganizationStoredProcedure,
  executeSystemStoredProcedureAllRecords,
  executeOrganizationBulkUpload,
  getDataType,
  executeSystemQuery,
  executeOrganizationQuery,
};
