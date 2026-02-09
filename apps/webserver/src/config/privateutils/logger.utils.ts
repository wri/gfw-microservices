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
const util = require('util');
const sql = require('mssql');
const winston = require('winston');
const Transport = require('winston-transport');
const sqlUtils = require('./sql.utils');

import { Request } from 'express';
import config from '../config';

// Important variables
export const listActivityTypes: Record<string, Record<string, number>> = {
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
    ListGetPaginatedListInfo: 38,
    ListInfo: 39,
    ListPrepareUpload: 40,
    ListGenerate: 41,
  },
  // new entries should start with value 38
};

/**
 * List of Session Variables (Not available until success of VerifyLogin):
 * @see {@link apps/webserver/src/config/publicutils/authenticationManager.utils.js}
 */
declare module 'express-session' {
  interface SessionData {
    // (Global)
    user_email: string;
    ispromanager: boolean;
    user_secret: string;
    user_id: number;
    // (For Regular Session)
    organization_id: number;
    organization_user_id: number;
    organization_database: string;
    organization_name: string;
    user_access_level_id: number;
    organization_status_id: number;
    user_first_name: string;
    user_last_name: string;
  }
}

// map from numeric ID to category and activtyType (reverse of listActivityTypes above)
const listActivityByID: any[] = [];
Object.keys(listActivityTypes).forEach((category: string) => {
  Object.keys(listActivityTypes[category]).forEach((activityType: string) => {
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

/**
 * @class SqlServerTransport
 *  @description Custom transport for winston to log messages to SQL Server.
 */
class SqlServerTransport extends Transport {
  constructor(options: any) {
    super(options);
  }

  async log(info: any, callback: (err?: any) => void) {
    const parameters = [
      { field: 'logDate', type: sql.DateTime, value: new Date() },
      { field: 'level', type: sql.NVarChar(30), value: info.level },
      { field: 'message', type: sql.NVarChar(sql.MAX), value: info[Symbol.for('message')] },
    ];
    try {
      await sqlUtils.appendLog(config.SQLConnection.logDatabase, 'insertLog', parameters);
      callback();
    } catch (err) {
      // if logging to database fails, we silently ignore the error
      callback();
    }
  }
}

/**
 * @function formatMeta
 * @param meta - metadata object that may contain a Symbol.for('splat') property
 * @summary Formats arguments in log messages with util.format so top level objects get expanded
 * @returns
 */
const formatMeta = (meta: any) => {
  const splat = meta[Symbol.for('splat')];
  if (splat && splat.length) {
    return splat.length === 1 ? util.format(splat[0]) : util.format(splat);
  }
  return '';
};

interface WinstonFormat {
  timestamp?: Date;
  level?: string;
  message: string;
  label: string;
  meta: any;
}
// console format into a single line with timestamp and level
const consoleFormat = winston.format.printf(
  ({ timestamp, level, message, label = '', ...meta }: WinstonFormat) =>
    `${timestamp} ${level}: ${label} ${message} ${formatMeta(meta)}`
);

/**
 * sql format is similar to consoleFormat() but without timestamp and level because
 * they are separate columns in the table
 */
const sqlFormat = winston.format.printf(
  ({ message, label = '', ...meta }: WinstonFormat) => `${label} ${message} ${formatMeta(meta)}`
);

// transports for winston (initially just console)
const transports: (typeof Transport)[] = [
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

// Finally, create the logger
const logger = winston.createLogger({ transports });

/**
 * @function logActivity
 * @summary Logs user activity to database.
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} activityTypeId - id of the activity type.
 * @param {String} activityDescription - description of actvity.
 * @return {Boolean} - return true if resolved or throws error.
 */
export const logActivity = (req: Request, activityTypeId: Number, activityDescription: string) => {
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
      .catch((err: Error) => {
        logger.error('Activity log error', activityTypeId, err);
        // even if logging activity fails, we don't want to block the main operation
        resolve(true);
      });
  });
};

/**
 * @function getActivityLog
 * @summary Changes the password of a user signed in.
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return A promise object that returns true if successful, error object otherwise.
 */
export const getActivityLog = (req: Request) => {
  return new Promise((resolve, reject) => {
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetActivityLog')
      .then((recordset: any[]) => {
        const newRes = recordset.map((data: any) => {
          const actInfo = listActivityByID[data.activity_type_id];
          const datetime =
            data.activity_time instanceof Date ? data.activity_time : new Date(data.activity_time);
          const { email, activity_description = 'Unknown' } = data;
          const { category = 'Unknown', activityType = 'Unknown' } = actInfo || {};
          const activity_time = datetime.toUTCString().replace(',', '');

          const newData = {
            email,
            activity_type_category_name: category,
            activity_type_name: activityType,
            activity_description: activity_description,
            activity_time,
          };
          return newData;
        });
        resolve(newRes);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
};

export const silly = logger.silly.bind(logger);
export const debug = logger.debug.bind(logger);
export const verbose = logger.verbose.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export default logger;
