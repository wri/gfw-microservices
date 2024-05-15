/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
/** ******************************************************************
 *   @name: sql.utils.js
 *   @description : A utility file to allow calling stored procedures
 *                 on databases. Used to get data from both the
 *                 main GFW databases, but also the organizations
 *                 database.
 *   @function {getTitles}
 *   @function {getCommodities}
 *   @function {getGeographies}
 *   @function {getAccessLevels}
 *   @function {getStatuses}
 *   @function {getUserEmail}
 *   @function {isAdministrator}
 *   @function {isEditor}
 *   @function {isProManager}
 *   @function {activateUser}
 *   @function {deactivateUser}
 *   @function {createNewUser}
 *   @function {updateUserInfo}
 *   @function {setStatus}
 *   @function {getUserSecret}
 *   @function {initialize}
 *
 ******************************************************************* */

// Imports required for this module.
const sql = require('mssql');
const path = require('path');
import config from '../config';

const langResources = require(path.resolve('./config/langResources'));
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const AWSCognito = require(path.resolve('./config/privateutils/cognito.utils'));
const SpeakEasy = require(path.resolve('./config/privateutils/speakeasy.utils'));
const rollbackUtils = require(path.resolve('./config/privateutils/rollback.utils'));
const { listStatusDescriptions, listStatus } = require(path.resolve(
  './config/env/listStatuses.constants'
));

import { UserAccessLevel } from '@wri-monorepos/constants';

const lstTitles = [
  { id: 1, title: 'Analyst' },
  { id: 2, title: 'Chief Risk Officer' },
  { id: 3, title: 'Risk Officer' },
  { id: 4, title: 'Regional Sustainability Officer' },
  { id: 5, title: 'Sustainability Director' },
  { id: 6, title: 'Procurement' },
  { id: 7, title: 'Supply Chain Manager' },
  { id: 8, title: 'Operations' },
  { id: 9, title: 'Corporate Affairs Officer' },
  { id: 10, title: 'Other (please specify)' },
];
const lstGeographies = [
  { id: 1, geography_name: 'Asia' },
  { id: 2, geography_name: 'Africa' },
  { id: 3, geography_name: 'North America' },
  { id: 4, geography_name: 'South America' },
  { id: 5, geography_name: 'Europe' },
  { id: 6, geography_name: 'Australia' },
];
const lstCommodities = [
  { id: 1, commmodity_name: 'cattle' },
  { id: 2, commmodity_name: 'cocoa' },
  { id: 3, commmodity_name: 'coffee' },
  { id: 4, commmodity_name: 'palm oil' },
  { id: 5, commmodity_name: 'pulp and paper' },
  { id: 6, commmodity_name: 'rubber' },
  { id: 7, commmodity_name: 'soy' },
  { id: 8, commmodity_name: 'sugar cane' },
];
const lstAccessLevels = [
  {
    id: 1,
    accesslevel_name: 'Administrator',
    accesslevel_description: 'Allows administration of the account.',
  },
  {
    id: 2,
    accesslevel_name: 'Editor',
    accesslevel_description: 'An editor can add/update/delete new/existing location data',
  },
  {
    id: 3,
    accesslevel_name: 'Viewer',
    accesslevel_description: 'A user allowed to run and view analysis on existing data',
  },
];

/**
 * @function getTitles
 * @summary Provides a list of titles for the user to choose from.
 * @return  An array of strings containing all the Titles.
 */
export function getTitles() {
  return lstTitles;
}

/**
 * @function getCommodities
 * @summary Provides a list of commodities for the user to choose from.
 * @return  An array of strings containing all the Commodities.
 */
export function getCommodities() {
  return lstCommodities;
}

/**
 * @function getGeographies
 * @summary Provides a list of Geographies for the user to choose from.
 * @return  An array of strings containing all the Geographies.
 */
export function getGeographies() {
  return lstGeographies;
}

/**
 * @function getAccessLevels
 * @summary Provides a list of Access Levels for the admin to choose from.
 * @return  An array of strings containing all the Access Levels.
 */
export function getAccessLevels() {
  return lstAccessLevels;
}

/**
 * @function getStatuses
 * @summary Provides a list of Statuses for the admin to choose from.
 * @return  An array of strings containing all the Statuses.
 */
export function getStatuses() {
  return listStatusDescriptions;
}

/**
 * @function getUserEmail
 * @summary Returns User Email from session vars
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return  String of user_email
 */
export function getUserEmail(req) {
  return req.session.user_email;
}

/**
 * @function isAdministrator
 * @summary Checks if the current user is an administrator.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return  true if administrator, false otherwise.
 */
export function isAdministrator(req) {
  if (req.session.user_access_level_id === config.platformVars.accessLevel.Administrator) {
    return true;
  }
  return false;
}

/**
 * @function isEditor
 * @summary Checks if the current user is an Editor.
 * @return  true if Editor, false otherwise.
 */
export function isEditor(req) {
  if (req.session.user_access_level_id === config.platformVars.accessLevel.Editor) {
    return true;
  }
  return false;
}

/**
 * @function isProManager
 * @summary Checks if the current user is a Pro Manager.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return  true if Pro Manager, false otherwise.
 */
export function isProManager(req) {
  if (req.session.ispromanager !== undefined && req.session.ispromanager === true) {
    return true;
  }
  return false;
}

/**
 * @function activateUser
 * @summary Activates a User that is pending.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param  {Number}   user_id A number containing the user ID of the user you want to activate.
 * @param  {String}   user_email A string containing the user email of the user you want to activate.
 * @return  A promise that resolves to true if user is successfully, rejected otherwise.
 */
export const activateUser = (
  req,
  user_id,
  user_email,
  first_name,
  last_name,
  unit_test = false
) => {
  return new Promise((resolve, reject) => {
    let organizationName;
    // Make sure the user is an Administrator before making the call.
    if (!isAdministrator(req)) {
      const errMessage = langResources.getResourceString('userisNotAnAdmin');
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotAdmin,
        errMessage,
        errMessage
      );
    }
    // Setup Parameters to pass to set status SP.
    const params = [
      { field: 'userID', type: sql.Int, value: user_id },
      { field: 'statusID', type: sql.Int, value: listStatus.Active },
      { field: 'activatedTime', type: sql.SmallDateTime, value: new Date() },
    ];
    // Set User Status in the organization database.
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspSetUserStatus', params)
      .then(() => {
        // Setup Parameters to pass to set status SP.
        const parameters = [
          { field: 'orgID', type: sql.Int, value: req.session.organization_id },
          { field: 'OrgUserID', type: sql.Int, value: user_id },
          { field: 'OrgUserStatusID', type: sql.Int, value: listStatus.Active },
        ];
        // Set User Status in the Routes Table.
        return sqlUtils.executeSystemStoredProcedure(req, 'uspSetUserRouteStatus', parameters);
      })
      .then((recordsets) => {
        const [record] = recordsets;
        organizationName = record.organization_name;
        // Create a new secret for the user in case it is needed. Default authentication preference to be 0 - email
        const secret = SpeakEasy.createSecret(req);
        const parameters = [
          { field: 'UserSecret', type: sql.VarChar(50), value: secret },
          { field: 'UserEmail', type: sql.NVarChar(50), value: user_email },
          { field: 'UserAuthPreferenceId', type: sql.Int, value: 0 },
        ];
        return sqlUtils.executeSystemStoredProcedure(req, 'uspActivateUser', parameters);
      })
      .then(() => {
        // Check if the account exists in Cognito.
        return AWSCognito.userExists(req, user_email);
      })
      .then((user_exists) => {
        if (user_exists) {
          const subject = 'Welcome to Global Forest Watch Pro!';
          const content = {
            organization_name: organizationName,
            first_name,
            last_name,
          };
          const msg = AWSSES.createBodyContent(
            req,
            config.platformVars.emailType.INVITATION,
            content
          );
          // Send the token via email to the user.
          return AWSSES.sendEmail(req, config.AWSVars.ses.sender, [user_email], subject, msg);
        }
        // Create new user in Cognito.
        return AWSCognito.createUser(req, user_email, false, unit_test);
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.User.UserActivated,
          `User '${user_email}' has been activated.`
        );
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToActivateUser,
          'Failed to update activate user',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @function deActivateUser
 * @summary Deactivates a User that is active/pending.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param  {Number}   user_id A number containing the user ID of the user you want to deactivate.
 * @return  A promise that resolves to true if user is successfully deactivated, rejected otherwise.
 */
export const deactivateUser = (req, user_id) => {
  return new Promise((resolve, reject) => {
    // Make sure the user is an Administrator before making the call.
    if (!isAdministrator(req)) {
      const errMessage = langResources.getResourceString('userisNotAnAdmin');
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotAdmin,
        errMessage,
        errMessage
      );
    }
    // Setup Parameters to pass to set status SP.
    const params = [
      { field: 'userID', type: sql.Int, value: user_id },
      { field: 'statusID', type: sql.Int, value: listStatus.Inactive },
      { field: 'activatedTime', type: sql.SmallDateTime, value: null },
    ];
    // Set User Status.
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspSetUserStatus', params)
      .then(() => {
        // Setup Parameters to pass to set status SP.
        const parameters = [
          { field: 'orgID', type: sql.Int, value: req.session.organization_id },
          { field: 'OrgUserID', type: sql.Int, value: user_id },
          { field: 'OrgUserStatusID', type: sql.Int, value: listStatus.Inactive },
        ];
        // Set User Status in the Routes Table.
        return sqlUtils.executeSystemStoredProcedure(req, 'uspSetUserRouteStatus', parameters);
      })
      .then((user) => {
        logger.logActivity(
          req,
          logger.listActivityTypes.User.UserDeactivated,
          `User '${user[0].user_email}' has been deactivated.`
        );
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeactiveUser,
          'Failed to deactivate activate user',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @function createNewUser
 * @summary Creates new user.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param  {String}   user_first_name - First Name of the user
 * @param  {String}   user_middle_initial - Middle Initial of the new user
 * @param  {String}   user_last_name - Last Name of the new user
 * @param  {String}   user_email - Email for the new user
 * @param  {String}   user_phone - Phone for the new user
 * @param  {Number}   user_title_id - Title for the new user
 * @param  {String}   other_title - Title name for Other title id
 * @param  {Number}   access_level_id - An ID representing the level of access allowed for this user.
 * @param  {Number}   email_subscription - An integer that is either 1 or 0.
 * @param  {Array}   arr_user_geography_ids - An array of geography Ids that the user is interested in.
 * @param  {Array}   arr_user_commodity_ids - An array of commodities (ids) that the user in interested in.
 * @return  A promise that resolves to true if user is successfully deactivated, rejected otherwise.
 */
export const createNewUser = (
  req,
  user_first_name,
  user_middle_initial,
  user_last_name,
  user_email,
  user_phone,
  user_title_id,
  other_title,
  access_level_id,
  email_subscription,
  arr_user_geography_ids,
  arr_user_commodity_ids,
  viirs_email_frequency = 0,
  glad_email_frequency = 0,
  forma_email_frequency = 0,
  terrai_email_frequency = 0,
  gran_chaco_email_frequency = 0
) => {
  let user_id;
  let uspCreateNewUser = false;
  let uspCreateNewUserRoute = false;
  return new Promise((resolve, reject) => {
    // Make sure the user is an Administrator before making the call.
    if (!isAdministrator(req)) {
      const errMessage = langResources.getResourceString('userisNotAnAdmin');
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotAdmin,
        errMessage,
        errMessage
      );
    }
    // Setup Parameters to pass to set status SP.
    const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: user_email }];
    // Check whether the user exists in the current organization.
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetUserInfoByEmail', params)
      .then((recordsets) => {
        // If the user already exists, return an error.
        if (recordsets.length > 0) {
          const errMessage = langResources.getResourceString('userExistInOrg');
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userExists,
            errMessage,
            user_email
          );
        } else {
          // Create the new user - Setup Parameters to pass to set status SP.
          const parameters = [
            { field: 'firstName', type: sql.NVarChar(35), value: user_first_name },
            { field: 'mi', type: sql.NVarChar(2), value: user_middle_initial },
            { field: 'lastName', type: sql.NVarChar(35), value: user_last_name },
            { field: 'email', type: sql.NVarChar(50), value: user_email },
            { field: 'phone', type: sql.NVarChar(50), value: user_phone },
            { field: 'titleId', type: sql.Int, value: user_title_id },
            { field: 'other_title', type: sql.NVarChar(150), value: other_title },
            { field: 'accessLevelId', type: sql.Int, value: access_level_id },
            { field: 'statusId', type: sql.Int, value: listStatus.Pending },
            { field: 'email_subscription', type: sql.Bit, value: email_subscription },
            {
              field: 'commodity_ids',
              type: sql.NVarChar(200),
              value: arr_user_commodity_ids.toString(),
            },
            {
              field: 'geography_ids',
              type: sql.NVarChar(200),
              value: arr_user_geography_ids.toString(),
            },
            { field: 'viirs_email_frequency', type: sql.Int, value: viirs_email_frequency },
            { field: 'glad_email_frequency', type: sql.Int, value: glad_email_frequency },
            { field: 'forma_email_frequency', type: sql.Int, value: forma_email_frequency },
            { field: 'terrai_email_frequency', type: sql.Int, value: terrai_email_frequency },
            {
              field: 'gran_chaco_email_frequency',
              type: sql.Int,
              value: gran_chaco_email_frequency,
            },
          ];
          // Add user to organization.
          return sqlUtils.executeOrganizationStoredProcedure(req, 'uspCreateNewUser', parameters);
        }
      })
      .then((recordsets) => {
        const [user] = recordsets;
        user_id = user.NewUserID;
        uspCreateNewUser = true;
        // Must declare before due to func structure
        uspCreateNewUserRoute = true;
        // Recordset received after creating user in organization.
        if (recordsets.length > 0) {
          const parameters = [
            { field: 'userEmail', type: sql.NVarChar(50), value: user_email },
            { field: 'orgID', type: sql.Int, value: req.session.organization_id },
            { field: 'OrgUserID', type: sql.Int, value: recordsets[0].NewUserID },
            { field: 'OrgUserStatusID', type: sql.Int, value: listStatus.Pending },
          ];
          // Add to User Routes.
          return sqlUtils.executeSystemStoredProcedure(req, 'uspCreateNewUserRoute', parameters);
        }
        const errMessage = langResources.getResourceString('userExistInOrg');
        throw new errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.userExists,
          errMessage,
          user_email
        );
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.User.UserCreated,
          `User '${user_email}' has been created in status "Pending."`
        );
        resolve(user_id);
      })
      .catch((errorMessage) => {
        if (uspCreateNewUser) {
          rollbackUtils.deleteOrganizationTableRow(req, 'Users', user_first_name, 'first_name');
          rollbackUtils.deleteOrganizationTableRow(req, 'UserGeographies', user_id, 'user_id');
          rollbackUtils.deleteOrganizationTableRow(req, 'UserCommodities', user_id, 'user_id');
        }
        if (uspCreateNewUserRoute) {
          rollbackUtils.dropUserRoute(req, user_email, req.session.organization_id, user_id);
        }
        if (Object.prototype.hasOwnProperty.call(errorMessage, 'errorCode')) {
          reject(errorMessage);
        } else {
          const errorObject = errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToCreateNewUser,
            'Failed to create new user',
            errorMessage
          );
          reject(errorObject);
        }
      });
  });
};

/**
 * @function updateUserInfo
 * @summary Updates user information.
 * @param  {Object}   params
 *  param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *  param  {Number}   user_id - Number specifying the user id. Need to provide to set user info.
 *  param  {String}   user_first_name - First Name of the user
 *  param  {String}   user_middle_initial - Middle Initial of the new user
 *  param  {String}   user_last_name - Last Name of the new user
 *  param  {String}   user_email - Email for the new user
 *  param  {String}   user_phone - Phone for the new user
 *  param  {Number}   user_title_id - Title for the new user
 *  param  {String}   other_title - Title text for Other title id
 *  param  {Number}   access_level_id - An ID representing the level of access allowed for this user.
 *  param  {Number}   email_subscription - An integer that is either 1 or 0.
 *  param  {Array}   arr_user_geography_ids - An array of geography Ids that the user is interested in.
 *  param  {Array}   arr_user_commodity_ids - An array of commodities (ids) that the user in interested in.
 *  param  {Number}  user_auth_preference_id
 * @return  A promise that resolves to true if user is successfully deactivated, rejected otherwise.
 */
export const updateUserInfo = ({
  req,
  user_id,
  user_first_name,
  user_middle_initial,
  user_last_name,
  user_email,
  user_phone,
  user_title_id,
  other_title,
  access_level_id,
  email_subscription,
  arr_user_geography_ids = [],
  arr_user_commodity_ids = [],
  user_auth_preference_id = 0,
  loggedUserAccessLevelId,
}) => {
  return new Promise((resolve, reject) => {
    const params = [
      { field: 'userId', type: sql.Int, value: user_id },
      { field: 'firstName', type: sql.NVarChar(35), value: user_first_name },
      { field: 'mi', type: sql.NVarChar(2), value: user_middle_initial },
      { field: 'lastName', type: sql.NVarChar(35), value: user_last_name },
      { field: 'email', type: sql.NVarChar(50), value: user_email },
      { field: 'phone', type: sql.NVarChar(50), value: user_phone },
      { field: 'titleId', type: sql.Int, value: user_title_id },
      { field: 'other_title', type: sql.NVarChar(150), value: other_title },
      { field: 'email_subscription', type: sql.Bit, value: email_subscription },
      { field: 'commodity_ids', type: sql.VarChar(200), value: arr_user_commodity_ids.toString() },
      { field: 'geography_ids', type: sql.VarChar(200), value: arr_user_geography_ids.toString() },
    ];
    const isUserAdmin = loggedUserAccessLevelId === UserAccessLevel.ADMIN;

    params.push({
      field: 'accessLevelId',
      type: sql.Int,
      value: isUserAdmin ? access_level_id : null,
    });

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspUpdateUser', params)
      .then(() => {
        // Need to update user authentication preference - this exists in system so must do separately
        const parameters = [
          { field: 'user_email', type: sql.NVarChar(150), value: user_email },
          { field: 'user_auth_preference_id', type: sql.Int, value: user_auth_preference_id },
        ];
        return sqlUtils.executeSystemStoredProcedure(
          req,
          'uspUpdateUserAuthenticationPreference',
          parameters
        );
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.User.UserUpdated,
          `User '${user_email}' info has been updated.`
        );
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdateUserInfo,
          'Failed to update user information',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * @function setStatus
 * @summary Sets the Status of the user.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return  true if successfull, false otherwise.
 */
export const setStatus = (req, status_id) => {
  return new Promise((resolve, reject) => {
    // Setup Parameters to pass to set status SP.
    const params = [
      { field: 'userEmail', type: sql.VarChar(50), value: req.session.user_email },
      { field: 'statusID', type: sql.Int, value: status_id },
    ];
    // Set User Status.
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspSetUserStatus', params)
      .then(() => {
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToSetStatus,
          'Failed to set status ID of user',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @function getUserSecret
 * @summary Returns base32 image of QR code to scan for Google Authentication
 * @param {Object} req
 * @return {Promise<String>} - base32 image to use as <img src=BASE32IMG />
 */
export const getUserSecret = (req, email) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      {
        field: 'user_email',
        type: sql.NVarChar(150),
        value: email,
      },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetUserSecret', parameters)
      .then((recordsets) => {
        // There should be one and only one user secret return anything else is prone to error
        if (recordsets.length === 1) {
          const { user_secret } = recordsets[0];
          const secret = SpeakEasy.getSecret(user_secret, email);
          resolve(secret);
          // Error
        } else {
          const errorObject = errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToGetSecret,
            'Failed to get user secret.',
            ''
          );
          throw errorObject;
        }
      })
      .catch((err) => {
        console.log('Error', err);
        reject(err);
      });
  });
};

/**
 * @function initialize
 * @summary Initializes the Account Manager module.
 */
export const initialize = () => {
  return AWSCognito.initialize();
};
