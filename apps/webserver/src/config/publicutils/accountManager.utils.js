/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
/** ******************************************************************
 *   @name: accountManager.utils.js
 *   @description : A public utility file to interact with the front end
 *                 regarding managing accounts
 *
 *   @function {requestNewAccount}
 *   @function {updateAccountProfile}
 *   @function {getClassifications}
 *   @function {getUsersList}
 *   @function {getAccountProfile}
 *   @function {initialize}
 *   @function {updatePendingAccount}
 *   @function {updatePendingAccountUser}
 *
 ******************************************************************* */
// Imports required for this module
const path = require('path');
const sql = require('mssql');
const AWS = require('aws-sdk');
const config = require('../config');

const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const rollbackUtils = require(path.resolve('./config/privateutils/rollback.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const snsUtils = require(path.resolve('./config/privateutils/sns.utils.js'));
// Local Variables.
const lstClassifications = [
  { id: 1, classification_name: 'Commercial Bank' },
  { id: 2, classification_name: 'Consumer Goods Manufacturer' },
  { id: 3, classification_name: 'Development Finance Institution' },
  { id: 4, classification_name: 'Governmental Organization' },
  { id: 5, classification_name: 'Investment Fund' },
  { id: 6, classification_name: 'NGO' },
  { id: 7, classification_name: 'Producer' },
  { id: 8, classification_name: 'Retailer' },
  { id: 9, classification_name: 'Processor/Trader' },
  { id: 10, classification_name: 'Service Provider' },
];

/** @function {requestNewAccount}
 *   @summary Creates a request for a new account in the database.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String}   org_name - Organization name
 *   @param  {String}   org_address - Organization Address.
 *   @param  {String}   org_website - URL for the Organization's website.
 *   @param  {String}   parent_org_name - Name of the parent organization, if there is one.
 *   @param  {Boolean}  is_subsidiary - Is the organiation a subsidiary? (If yes, parent name is mandatory)
 *   @param  {Array}    arr_org_classification_ids - Classification(s) of the organizations.
 *   @param  {String}   user_first_name - First Name of the manager (Administrative User)
 *   @param  {String}   user_middle_initial - Middle Initial of the manager (Administrative User)
 *   @param  {String}   user_last_name - Last Name of the manager (Administrative User)
 *   @param  {String}   user_email - Email for the manager (Administrative User)
 *   @param  {String}   user_phone - Phone for the manager (Administrative User)
 *   @param  {Number}   user_title_id - Title for the manager (Administrative User)
 *   @param  {String}   other_title - Other title for Other user_title_id
 *   @param  {Array}   arr_user_geography_ids - An array of geography Ids that the user is interested in.
 *   @param  {Array}   arr_user_commodity_ids - An array of commodities (ids) that the user in interested in.
 *   @param  {Array}   policyList - array of policies to upload
 *   @param  {Array}   policyNames - array of policy names
 *   @return {Promise<Boolean>} True if successful, false otherwise.
 */
const requestNewAccount = (
  req,
  org_name,
  org_address,
  org_website,
  parent_org_name,
  is_subsidiary,
  arr_org_classification_ids,
  user_first_name,
  user_middle_initial,
  user_last_name,
  user_email,
  user_phone,
  user_title_id,
  other_title,
  arr_user_geography_ids,
  arr_user_commodity_ids,
  policyList,
  policyNames
) => {
  // Declare Important Variables.
  let organizationId;
  let userId;
  // Rollback Variables
  let uspCreateNewAccountExecuted = false;
  let uspCreateNewAccountClassificationsExecuted = false;
  let uspCreateNewAccountUserExecuted = false;
  let uspCreateNewAccountUserGeographiesExecuted = false;
  let uspCreateNewAccountUserCommoditiesExecuted = false;
  return new Promise((resolve, reject) => {
    // Setup Parameters for a new account request.
    const params = [
      { field: 'orgName', type: sql.NVarChar(200), value: org_name },
      { field: 'orgAddress', type: sql.NVarChar(200), value: org_address },
      { field: 'orgWebsite', type: sql.NVarChar(200), value: org_website },
      { field: 'isSubsidiary', type: sql.Bit, value: is_subsidiary },
      { field: 'orgParent', type: sql.NVarChar(200), value: parent_org_name },
      { field: 'requestDate', type: sql.SmallDateTime, value: new Date() },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspCreateNewAccount', params)
      .then((recordsets) => {
        uspCreateNewAccountExecuted = true;
        // Get Organization ID
        if (recordsets.length > 0) {
          organizationId = recordsets[0].organization_id;
          // Use Organization ID to add Classifications.
          const parameters = [
            { field: 'orgID', type: sql.Int, value: organizationId },
            {
              field: 'classification_ids',
              type: sql.VarChar(200),
              value: arr_org_classification_ids.toString(),
            },
          ];
          // Add classifications for new account.
          return sqlUtils.executeSystemStoredProcedure(
            req,
            'uspCreateNewAccountClassifications',
            parameters
          );
        }
        // TODO @Hanseul - handle error
        console.log('ERROR: Recordset Length', recordsets.length);
      })
      .then(() => {
        // Insert the new user account
        uspCreateNewAccountClassificationsExecuted = true;
        const parameters = [
          { field: 'orgID', type: sql.Int, value: organizationId },
          { field: 'firstName', type: sql.NVarChar(35), value: user_first_name },
          { field: 'mi', type: sql.NVarChar(2), value: user_middle_initial },
          { field: 'lastName', type: sql.NVarChar(35), value: user_last_name },
          { field: 'email', type: sql.NVarChar(50), value: user_email },
          { field: 'phone', type: sql.NVarChar(50), value: user_phone },
          { field: 'titleId', type: sql.Int, value: user_title_id },
          { field: 'other_title', type: sql.NVarChar(150), value: other_title },
        ];
        // Add Admin user for new account.
        return sqlUtils.executeSystemStoredProcedure(req, 'uspCreateNewAccountUser', parameters);
      })
      .then((recordsets) => {
        uspCreateNewAccountUserExecuted = true;
        // Get User ID
        if (recordsets.length > 0) {
          userId = recordsets[0].user_id;
          const parameters = [
            { field: 'userID', type: sql.Int, value: userId },
            {
              field: 'geography_ids',
              type: sql.VarChar(200),
              value: arr_user_geography_ids.toString(),
            },
          ];
          // Add Geographies for new user for new account.
          return sqlUtils.executeSystemStoredProcedure(
            req,
            'uspCreateNewAccountUserGeographies',
            parameters
          );
        }
        // TODO @Hanseul - handle error
      })
      .then(() => {
        uspCreateNewAccountUserGeographiesExecuted = true;
        // Use User ID to add Commodities.
        const parameters = [
          { field: 'userID', type: sql.Int, value: userId },
          {
            field: 'commodity_ids',
            type: sql.VarChar(200),
            value: arr_user_commodity_ids.toString(),
          },
        ];
        // Add Commodities for new user for new account.
        return sqlUtils.executeSystemStoredProcedure(
          req,
          'uspCreateNewAccountUserCommodities',
          parameters
        );
      })
      .then(() => {
        uspCreateNewAccountUserCommoditiesExecuted = true;
        // Upload policy documents!
        return PolicyManager.uploadPendingPolicies(req, organizationId, policyList, policyNames);
      })
      .then(() => {
        /*
          At this point the request is a sucess, we need to notify
          both the requesting user AND WRI that a new account has been requested
        */
        const subject = 'GFW Pro Account Application Notification';
        const content = {
          org_name,
          org_address,
          org_website,
          parent_org_name,
          is_subsidiary,
          arr_org_classification_ids,
          user_first_name,
          user_middle_initial,
          user_last_name,
          user_email,
          user_phone,
          user_title_id,
          arr_user_geography_ids,
          arr_user_commodity_ids,
          policyList,
          policyNames,
        };

        // TODO - need to determine who/how receiving account requests on WRI Admin side
        // const operationAdministratorMessage = AWSSES.createBodyContent(req, config.platformVars.emailType.NEW_ORGANIZATION, content);
        // AWSSES.sendEmail(req, config.AWSVars.ses.sender, [''], subject, operationAdministratorMessage);
        // Send a notification when a new account request is made.
        snsUtils.publish(config.platformVars.snsType.NEW_ORGANIZATION, content);

        // Send the token via email to the user.
        const requestingUserMessage = AWSSES.createBodyContent(
          req,
          config.platformVars.emailType.REQUEST_ORGANIZATION,
          content
        );
        AWSSES.sendEmail(
          req,
          config.AWSVars.ses.sender,
          [user_email],
          subject,
          requestingUserMessage
        );
        resolve(true);
      })
      .catch((errorMessage) => {
        if (uspCreateNewAccountExecuted) {
          rollbackUtils.deleteSystemTableRow(req, 'PendingAccounts', organizationId, 'id');
        }
        if (uspCreateNewAccountClassificationsExecuted) {
          rollbackUtils.deleteSystemTableRow(
            req,
            'PendingAccountsClassifications',
            organizationId,
            'pendingaccounts_id'
          );
        }
        if (uspCreateNewAccountUserExecuted) {
          rollbackUtils.deleteSystemTableRow(
            req,
            'PendingAccountsUsers',
            organizationId,
            'pendingaccounts_id'
          );
        }
        if (uspCreateNewAccountUserGeographiesExecuted) {
          rollbackUtils.deleteSystemTableRow(
            req,
            'PendingAccountsUsersGeographies',
            userId,
            'pendingaccountsuser_id'
          );
        }
        if (uspCreateNewAccountUserCommoditiesExecuted) {
          rollbackUtils.deleteSystemTableRow(
            req,
            'PendingAccountsUsersCommodities',
            userId,
            'pendingaccountsuser_id'
          );
        }
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToRequestAccount,
          `Failed to request account for ${org_name}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getAccountProfile}
 *   @summary Gets account profile from DB
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Object} Returns recordsets if successful otherwise, error object
 */
const getAccountProfile = (req) => {
  return new Promise((resolve, reject) => {
    const params = [
      { field: 'orgID', type: sql.Int, value: req.session.organization_id },
      { field: 'orgStatusID', type: sql.Int, value: req.session.organization_status_id },
    ];
    // Get Account Profile.
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetAccountProfile', params)
      .then((recordsets) => {
        resolve(recordsets[0]);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetAccountProfile,
          'Failed to get account profile',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {updateAccountProfile}
 *   @summary Updates the profile information for an account.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String} org_name - Organization name
 *   @param  {String} org_address - Organization Address.
 *   @param  {String} org_website - URL for the Organization's website.
 *   @param  {String} parent_org_name - Name of the parent organization, if there is one.
 *   @param  {Boolean} is_subsidiary - Is the organiation a subsidiary? (If yes, parent name is mandatory)
 *   @param  {Array} arr_org_classification_ids - Classification(s) of the organizations.
 *   @return {Promise<Boolean>} True if successful, false otherwise.
 */
const updateAccountProfile = (
  req,
  org_name,
  org_address,
  org_website,
  parent_org_name,
  is_subsidiary,
  arr_org_classification_ids
) => {
  return new Promise((resolve, reject) => {
    // Setup parameters to update account profile.
    const params = [
      { field: 'orgName', type: sql.NVarChar(200), value: org_name },
      { field: 'orgAddress', type: sql.NVarChar(200), value: org_address },
      { field: 'orgWebsite', type: sql.NVarChar(200), value: org_website },
      { field: 'isSubsidiary', type: sql.Bit, value: is_subsidiary },
      { field: 'orgParent', type: sql.NVarChar(200), value: parent_org_name },
    ];
    // Update Account Profile.
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspUpdateAccountProfile', params)
      .then(() => {
        // Update Classifications
        const parameters = [
          {
            field: 'classification_ids',
            type: sql.VarChar(200),
            value: arr_org_classification_ids.toString(),
          },
        ];
        // Update Classifications for Account.
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspUpdateAccountClassifications',
          parameters
        );
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.Account.AccountUpdated,
          `User '${req.session.user_email}' has updated account information.`
        );
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdateAccount,
          `Failed to update ${org_name}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getClassifications}
 *   @summary Provides a list of classifications for the organization.
 *   @return  An array of strings containing all the Classifications.
 */
const getClassifications = () => {
  return lstClassifications;
};

/** @function {getUsersList}
 *   @summary Provides a list of users for the organization.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return  An array of objects containing all the user info.
 */
const getUsersList = (req) => {
  let usersList = [];
  return new Promise((resolve, reject) => {
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetUsersList')
      .then((recordsets) => {
        // Users list is missing authentication preference which is stored in SYSTEM so retrieve
        usersList = recordsets;
        const params = [
          { field: 'organization_id', type: sql.Int, value: req.session.organization_id },
        ];
        return sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetUsersAuthenticationPreferences',
          params
        );
      })
      .then((results) => {
        // Use Object.assign() to assign the correct authentication preference to user
        usersList.forEach((user) => {
          results.forEach((result) => {
            if (user.email === result.user_email) {
              user.auth_preference_id = result.auth_preference_id;
            }
          });
        });
        resolve(usersList);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetUsersList,
          "Failed to get User's List",
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {updatePendingAccount}
 * @summary Creates a request for a new account in the database.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param  {String}   org_id - Organization ID
 * @param  {String}   org_name - Organization name
 * @param  {String}   org_address - Organization Address.
 * @param  {String}   org_website - URL for the Organization's website.
 * @param  {String}   parent_org_name - Name of the parent organization, if there is one.
 * @param  {Boolean}  is_subsidiary - Is the organiation a subsidiary? (If yes, parent name is mandatory)
 * @param  {Array}    arr_org_classification_ids - Classification(s) of the organizations.
 * @return {Promise<Boolean>} True if successful, false otherwise.
 */
const updatePendingAccount = (
  req,
  org_id,
  org_name,
  org_address,
  org_website,
  parent_org_name,
  is_subsidiary,
  arr_org_classification_ids
) => {
  return new Promise((resolve, reject) => {
    const params = [
      { field: 'orgID', type: sql.Int, value: org_id },
      { field: 'orgName', type: sql.NVarChar(200), value: org_name },
      { field: 'orgAddress', type: sql.NVarChar(200), value: org_address },
      { field: 'orgWebsite', type: sql.NVarChar(200), value: org_website },
      { field: 'isSubsidiary', type: sql.Bit, value: is_subsidiary },
      { field: 'orgParent', type: sql.NVarChar(200), value: parent_org_name },
      {
        field: 'classification_ids',
        type: sql.NVarChar(200),
        value: arr_org_classification_ids.toString(),
      },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspUpdatePendingAccount', params)
      .then(() => {
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdateAccount,
          `Failed to update ${org_name}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {updatePendingAccountUser}
 *   @summary Creates a request for a new account in the database.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String}   user_id - User id
 *   @param  {String}   user_first_name - First Name of the manager (Administrative User)
 *   @param  {String}   user_middle_initial - Middle Initial of the manager (Administrative User)
 *   @param  {String}   user_last_name - Last Name of the manager (Administrative User)
 *   @param  {String}   user_email - Email for the manager (Administrative User)
 *   @param  {String}   user_phone - Phone for the manager (Administrative User)
 *   @param  {Number}   user_title_id - Title for the manager (Administrative User)
 *   @param  {Array}   arr_user_geography_ids - An array of geography Ids that the user is interested in.
 *   @param  {Array}   arr_user_commodity_ids - An array of commodities (ids) that the user in interested in.
 *   @return {Promise<Boolean>} True if successful, false otherwise.
 */
const updatePendingAccountUser = (
  req,
  user_id,
  user_first_name,
  user_middle_initial,
  user_last_name,
  user_email,
  user_phone,
  user_title_id,
  arr_user_geography_ids,
  arr_user_commodity_ids
) => {
  return new Promise((resolve, reject) => {
    const params = [
      { field: 'userID', type: sql.Int, value: user_id },
      { field: 'firstName', type: sql.NVarChar(35), value: user_first_name },
      { field: 'mi', type: sql.NVarChar(2), value: user_middle_initial },
      { field: 'lastName', type: sql.NVarChar(35), value: user_last_name },
      { field: 'email', type: sql.NVarChar(50), value: user_email },
      { field: 'phone', type: sql.NVarChar(50), value: user_phone },
      { field: 'titleId', type: sql.Int, value: user_title_id },
      { field: 'geography_ids', type: sql.NVarChar(200), value: arr_user_geography_ids.toString() },
      { field: 'commodity_ids', type: sql.NVarChar(200), value: arr_user_commodity_ids.toString() },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspCreateNewAccountUser', params)
      .then(() => {
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdateUser,
          `Failed to update ${user_first_name}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {initialize}
 * @summary Initializes the Account Manager module. Loads all the lists needed for the application.
 */
const initialize = () => {
  const objTemp = {
    accessKeyId: config.AWSVars.credentials.accessKey,
    secretAccessKey: config.AWSVars.credentials.secretKey,
    region: config.AWSVars.cognito.region,
  };
  // Setup the AWS Config with the proper credentials.
  AWS.config.update(objTemp);
};

// Exporting the functions.
module.exports = {
  requestNewAccount,
  updateAccountProfile,
  getClassifications,
  getUsersList,
  getAccountProfile,
  initialize,
  updatePendingAccount,
  updatePendingAccountUser,
};
