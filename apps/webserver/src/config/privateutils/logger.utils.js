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
const util = require('util');
const sql = require('mssql');
const winston = require('winston');
const Transport = require('winston-transport');
const config = require('../config');

// eslint-disable-next-line import/no-dynamic-require
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
// Important variables
const listActivityTypes = {
  Account: {
    AccountRequested: 1,
    AccountActivated: 2,
    AccountDeactivated: 3,
    AccountUpdated: 4,
  },
  User: {
    UserCreated: 5,
    UserUpdated: 6,
    UserLogin: 7,
    UserLogout: 8,
    UserActivated: 9,
    UserForgotPassword: 10,
    UserResetPassword: 11,
    UserDeactivated: 12,
  },
  List: {
    LocationUploadedToList: 13,
    LocationDeletedFromList: 14,
    LocationCopiedToList: 15,
    LocationUpdatedInList: 16,
    LocationMovedFromList: 17,
    ListCreated: 18,
    ListUpdate: 19,
    ListUpdateNew: 20,
    ListDeleted: 21,
    ListAnalyzing: 22,
    // see backward compat comment and code below (listActivityByID[23-25])
    ListShared: 35,
    ListUnShared: 36,
    ListUnSharedWithAll: 37,
  },
  b2b: {
    ConnectionRequested: 28,
    ConnectionAccepted: 29,
    ConnectionRejected: 30,
    ConnectionResent: 31,
    ConnectionCancelled: 32,
  },
  // new entries should start with value 38
};

// map from numeric ID to category and activtyType (reverse of listActivityTypes above)
const listActivityByID = [];
Object.keys(listActivityTypes).forEach((category) => {
  Object.keys(listActivityTypes[category]).forEach((activityType) => {
    listActivityByID[listActivityTypes[category][activityType]] = { category, activityType };
  });
});

// listActivityTypes used to be in the database under two tables named ActivityType and ActivityTypeCategory
// For unknown reason, the databases for different environments (dev/prod) had different values for three rows
// Now that this information is in code vs. DB, we insert backward compatibility values in listActivityByID
// so all environments continue working as before
listActivityByID[23] = { category: 'List', activityType: 'ListShared' };
listActivityByID[24] = { category: 'List', activityType: 'ListUnShared' };
listActivityByID[25] = { category: 'List', activityType: 'ListUnSharedWithAll' };

// Set time format
const tsFormat = () =>
  new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  });

// Custom transport for winston to log to SQL Server
class SqlServerTransport extends Transport {
  constructor(options) {
    super(options);
  }

  async log(info, callback) {
    const parameters = [
      { field: 'logDate', type: sql.DateTime, value: new Date() },
      { field: 'level', type: sql.NVarChar(30), value: info.level },
      { field: 'message', type: sql.NVarChar(sql.MAX), value: info[Symbol.for('message')] },
    ];
    try {
      await sqlUtils.appendLog(config.SQLConnection.logDatabase, 'insertLog', parameters);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}

// format arguments in log messages with util.format so top level objects get expanded
const formatMeta = (meta) => {
  const splat = meta[Symbol.for('splat')];
  if (splat && splat.length) {
    return splat.length === 1 ? util.format(splat[0]) : util.format(splat);
  }
  return '';
};

// console format into a single line with timestamp and level
const consoleFormat = winston.format.printf(
  ({ timestamp, level, message, label = '', ...meta }) =>
    `${timestamp} ${level}: ${label} ${message} ${formatMeta(meta)}`
);

// sql format is similar to consoleFormat() but without timestamp and level because
// they are separate columns in the table
const sqlFormat = winston.format.printf(
  ({ message, label = '', ...meta }) => `${label} ${message} ${formatMeta(meta)}`
);

// transports for winston (initially just console)
const transports = [
  new winston.transports.Console({
    level: 'debug', // debug and higher logs only
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      consoleFormat
    ),
  }),
];

// If logDB is specified, also setup SQL server transport
if (config.SQLConnection.logDatabase) {
  transports.push(
    new SqlServerTransport({
      level: 'error', // errors only
      format: sqlFormat,
    })
  );
}

// finally create the logger
const logger = winston.createLogger({ transports });

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
        logger.info(`Activity logged: ${activityDescription}`);
        resolve(true);
      })
      .catch((err) => {
        logger.error('Activity log error', activityTypeId, err);
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
        const newRes = recordset.map((data) => {
          const actInfo = listActivityByID[data.activity_type_id];
          const datetime =
            data.activity_time instanceof Date ? data.activity_time : new Date(data.activity_time);
          const newData = {
            email: data.email,
            activity_type_category_name: actInfo.category,
            activity_type_name: actInfo.activityType,
            activity_description: data.activity_description,
            activity_time: datetime.toUTCString().replace(',', ''),
          };
          return newData;
        });
        resolve(newRes);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  listActivityTypes,
  log,
  // re-exported logger methods need to be bound to logger to access this/self properties
  silly: logger.silly.bind(logger),
  debug: logger.debug.bind(logger),
  verbose: logger.verbose.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  logActivity,
  getActivityLog,
};
