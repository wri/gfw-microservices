/** ******************************************************************
 *   @name: logger.utils.js
 *   @description: A utility file to trail User interaction with the
 *                 application and log errors.
 *
 *   @function {log}
 *   @function {logActivity}
 *   @function {getActivityLog}
 *
 ******************************************************************* */
// Import required modules
const path = require('path');
const sql = require('mssql');
const winston = require('winston');
const config = require('../config');
require('winston-mssql');

// eslint-disable-next-line import/no-dynamic-require
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
// Important variables
const listActivityTypes = {};

// Set time format
const tsFormat = () =>
  new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    // Write into database - GFW Pro is running off a cluster of instances - need to centralize logs
    // eslint-disable-next-line new-cap
    new winston.transports.mssql({
      connectionString: `mssql://${config.SQLConnection.username}:${config.SQLConnection.password}@${config.SQLConnection.host}:${config.SQLConnection.port}/${config.SQLConnection.logDatabase}`,
      table: 'NodeLogs',
      timestamp: tsFormat,
      level: 'error',
      json: false,
    }),
  ],
});

/**
 * @function log
 * @summary log utility function.
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param logger - logger that will be logged to.
 * @param {Integer} level - level of severity for the logger.
 * @param {String} message - message that will be logged.
 */
const log = (req, level, message) => {
  // Log the message based on severity level
  switch (level) {
    case 0:
      logger.log('error', message.userMessage);
      break;
    case 1:
      logger.log('warn', message.userMessage);
      break;
    case 2:
      logger.log('info', message.userMessage);
      break;
    case 3:
      logger.log('verbose', message.userMessage);
      break;
    case 4:
      logger.log('debug', message.userMessage);
      break;
    case 5:
      logger.log('silly', message.userMessage);
      break;
    default:
      logger.log('info', message.userMessage);
      break;
  }
};

/**
 * @function logActivity
 * @summary Logs user activity to database.
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Integer} activityTypeId - id of the activity type.
 * @param {String} activityDescription - description of actvity.
 * @return {Boolean} - return true if resolved or throws error.
 */
const logActivity = (req, activityTypeId, activityDescription) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'userID', type: sql.Int, value: req.session.organization_user_id },
      { field: 'activityTypeID', type: sql.Int, value: activityTypeId },
      { field: 'activityDescription', type: sql.NVarChar(sql.MAX), value: activityDescription },
      { field: 'activityTime', type: sql.DateTime, value: new Date() },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspSetActivityLog', parameters)
      .then(() => {
        console.log(`Activity logged: ${activityDescription}`);
        resolve(true);
      })
      .catch((err) => {
        console.log('Activity log error', activityTypeId, err);
        reject(err);
      });
  });
};

/**
 * @function getActivityLog
 * @summary Changes the password of a user signed in.
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return A promise object that returns true if successful, error object otherwise.
 */
const getActivityLog = (req) => {
  return new Promise((resolve, reject) => {
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetActivityLog')
      .then((recordset) => {
        recordset.map((data) => {
          // eslint-disable-next-line no-param-reassign
          data.activity_time = data.activity_time.toUTCString().replace(',', '');
          return data;
        });
        resolve(recordset.reverse());
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @function initialize
 * @summary Initializes the Account Manager module.
 *           Loads all the lists needed for the application.
 */
const initialize = () => {
  return new Promise((resolve, reject) => {
    // Get Activity Types
    sqlUtils
      .executeSystemStoredProcedure(null, 'uspGetActivityTypes')
      .then((recordsets) => {
        recordsets.forEach((activityType) => {
          const activityCategoryName = activityType.ActivityCategoryName;
          const activityTypeName = activityType.ActivityTypeName;
          const activityTypeID = activityType.ActivityTypeID;
          if (Object.prototype.hasOwnProperty.call(listActivityTypes, activityCategoryName)) {
            listActivityTypes[activityCategoryName][activityTypeName] = activityTypeID;
          } else {
            listActivityTypes[activityCategoryName] = {};
            listActivityTypes[activityCategoryName][activityTypeName] = activityTypeID;
          }
        });
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  listActivityTypes,
  log,
  logActivity,
  getActivityLog,
  initialize,
};
