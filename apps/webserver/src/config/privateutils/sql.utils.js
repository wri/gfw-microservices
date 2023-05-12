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
    if (!cachedPools[connectConfig.database]) {
      // Create a SQL Connection and add to the cached pools
      const poolPreConnect = new sql.ConnectionPool(connectConfig);
      const poolConnected = await poolPreConnect.connect();
      poolConnected.on('error', (err) => {
        logger.error('SQL Pool Error:', err);
        removePool(connectConfig);
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
 * Execute given query or stored procedure with given DB config
 * @param {Object} connectConfig - configuration for sql connection
 * @param {String} queryStrParam - SQL query string or null
 * @param {String} storedProcedureName - name of the stored procedure to execute or null
 * @param {Array} params - An array of parameters to pass to the stored procedure (OPTIONAL)
 * @returns Promise with data returned by given stored proedure
 */
const mssqlExecute = async (connectConfig, queryStrParam, storedProcedureName, params) => {
  try {
    if (queryStrParam && storedProcedureName) {
      throw new Error('Both query and stored procedure specified');
    }
    const pool = await getPool(connectConfig);
    // Get Request Object. Query
    const request = new sql.Request(pool);
    // Add parameters to the request object.
    if (params && Array.isArray(params)) {
      params.forEach((param) => {
        request.input(param.field, param.type, param.value);
      });
    }

    // Some stored procedures have been converted to queries using storedProcedureName as the query identifier
    // Check for those before issue query instead of the stored procedure for those.
    const queryStr = queryStrParam || (await sqlQueries.getQueryStr(connectConfig, storedProcedureName, params));
    let rawResults;
    if (queryStr) {
      rawResults = await request.query(queryStr);
    } else {
      rawResults = await request.execute(storedProcedureName);
    }
    return rawResults.recordsets;
  } catch (err) {
    logger.error('mssqlExecute failed ', queryStrParam, storedProcedureName);
    logger.error(err);
    removePool(connectConfig);
    throw err;
  }
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
