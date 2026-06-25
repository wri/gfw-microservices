/* eslint-disable new-cap */
/* eslint-disable camelcase */
/** ******************************************************************
 *   @name: proManager.utils.js
 *   @description : A utility file to allow GFW Pro Managers to login
 *                 to the pro-manager site to review and activate
 *                 pending accounts.
 *   @function {authenticateProUser}
 *   @function {getAllAccountsList}
 *   @function {getAllUsersList}
 *   @function {activatePendingAccount}
 *   @function {updatePendingAccountUser}
 *   @function {deletePendingAccountRequest}
 *   @function {deactivateAccount}
 *   @function {updateAccountSubscriptionStatus}
 *   @function {updateGlobalAnalysisLimits}
 *   @function {updateAccountAnalysisLimits}
 *
 ******************************************************************* */
// Imports required for this module.
const path = require('path');
const sql = require('mssql');
import config from '../config';
// Private Utils
const awsCognito = require(path.resolve(__dirname, '../privateutils/cognito.utils'));
const awsSes = require(path.resolve(__dirname, '../privateutils/ses.utils'));
const errorUtils = require(path.resolve(__dirname, '../privateutils/error.utils'));
const Helper = require(path.resolve(__dirname, '../publicutils/helper.utils'));
const langResources = require(path.resolve(__dirname, '../langResources'));
const logger = require(path.resolve(__dirname, '../privateutils/logger.utils'));
const speakEasy = require(path.resolve(__dirname, '../privateutils/speakeasy.utils'));
const sqlUtils = require(path.resolve(__dirname, '../privateutils/sql.utils'));
const rollbackUtils = require(path.resolve(__dirname, '../privateutils/rollback.utils'));
// Public Utils
const UserManager = require(path.resolve(__dirname, '../publicutils/userManager.utils'));
const PolicyManager = require(path.resolve(__dirname, '../publicutils/policyManager.utils'));
const AccountManager = require(path.resolve(__dirname, '../publicutils/accountManager.utils'));
const { orgAccountStatus } = require(path.resolve(__dirname, '../env/orgAccountStatus.constants'));
// SQL Queries
import {
  getPendingAccountInformation,
  setOrganizationCustomAnalysisLimits,
  setGlobalAnalysisLimit,
  setOrganizationRenewalTime,
  Organization,
  ClientStoreConnection,
} from '@wri-monorepos/sql';

import { getOrganizationStatus } from './authenticationManager.utils';

/**
 * @function getAllAccountsList
 * @summary Gets an array of All Accounts.
 * @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @returns returns an Array of objects, where each object is info on the accounts.
 */
export const getAllAccountsList = async (req) => {
  // Check to make sure the user is a proper pro manager.
  if (!UserManager.isProManager(req)) {
    const userMessage = langResources.getResourceString('userIsNotAnAdmin');
    const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotProManager,
      userMessage,
      sysMessage
    );
  }

  try {
    // Get List of pending accounts.
    const recordsets = await sqlUtils.executeSystemStoredProcedure(req, 'uspGetAllAccountsList');
    return recordsets;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetAllAccountsList,
      'Failed to get all accounts list',
      err
    );
  }
};

/**
 * @function getAllUsersList
 * @summary Gets an array of All Users.
 * @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @returns returns an Array of objects, where each object is info on the accounts.
 */
export const getAllUsersList = async (req) => {
  // Check to make sure the user is a proper pro manager.
  if (!UserManager.isProManager(req)) {
    const userMessage = langResources.getResourceString('userIsNotAnAdmin');
    const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotProManager,
      userMessage,
      sysMessage
    );
  }

  try {
    const recordsets = await sqlUtils.executeSystemStoredProcedure(req, 'uspGetAllUsersList');
    return recordsets;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetAllUsersList,
      'Failed to get all users list',
      err
    );
  }
};

/** @function {activatePendingAccount}
 *   @summary Activates a Pending Account
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number}  pendingAccountId An integer specifying the pending account ID.
 *   @return {Promise} return a promise object. If successful,
 *                   the promise resolves to true, otherwise, an
 *                   an error object is returned in the reject.
 */
export const activatePendingAccount = async (req, pendingAccountId, unit_test = false) => {
  let userID = 0;
  let userEmail = '';
  let userExists = 0;
  let orgID = 0;
  let content = /** @type {any} */ ({});

  try {
    // Get data for emails
    const titles = UserManager.getTitles(req);
    const commodities = UserManager.getCommodities(req);
    const geographies = UserManager.getGeographies(req);
    const classifications = AccountManager.getClassifications(req);

    // Get all accounts list
    const accountsList = await sqlUtils.executeSystemStoredProcedure(req, 'uspGetAllAccountsList');

    const pendingOrganization = accountsList.find(
      (org) =>
        org.organization_id === pendingAccountId &&
        org.organization_status_id === orgAccountStatus.Pending
    );
    const nonPendingOrganizations = accountsList.filter(
      (org) =>
        org.organization_status_id === orgAccountStatus.Active ||
        org.organization_status_id === orgAccountStatus.Inactive
    );

    // check if pending org name matches any active org names
    if (
      nonPendingOrganizations.some(
        (org) =>
          org.organization_name.toLowerCase() ===
          pendingOrganization.organization_name.toLowerCase()
      )
    ) {
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.failedToActivateAccount,
        'Organization name already exists',
        {}
      );
    }

    // Get pending account information
    const parameters = [{ field: 'pendingaccount_id', type: sql.Int, value: pendingAccountId }];
    const accountInfo = await sqlUtils.executeSystemQuery(getPendingAccountInformation, parameters);

    const record = accountInfo?.[0]?.[0];
    userID = record.id;
    const titleObject =
      record.title_id === 10
        ? { title: record.other_title }
        : titles.filter((title) => title.id === record.title_id)[0];
    content = {
      org_country: record.organization_country || '',
      org_name: record.organization_name,
      is_subsidiary: record.organization_is_subsidiary,
      parent_org_name: record.organization_parent,
      org_website: record.organization_website,
      org_address: record.organization_address,
      policyNames: [],
      arr_org_classification_ids: [],
      user_first_name: record.first_name,
      user_last_name: record.last_name,
      user_email: record.email,
      user_phone: record.phone,
      user_title_id: titleObject.title,
      user_other_title: record.other_title,
      arr_user_geography_ids: [],
      arr_user_commodity_ids: [],
    };

    // Get user and organization details
    const userParameters = [{ field: 'pending_user_id', type: sql.Int, value: userID }];
    const orgParameters = [
      { field: 'pending_organization_id', type: sql.Int, value: pendingAccountId },
    ];
    const [commodityRecords, geographyRecords, policyRecords, classificationRecords] =
      await Promise.all([
        sqlUtils.executeSystemStoredProcedure(req, 'uspGetPendingUserCommodities', userParameters),
        sqlUtils.executeSystemStoredProcedure(req, 'uspGetPendingUserGeographies', userParameters),
        sqlUtils.executeSystemStoredProcedure(req, 'uspGetPendingAccountPolicies', orgParameters),
        sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetPendingAccountClassification',
          orgParameters
        ),
      ]);

    const policyArray = policyRecords.map((policy) => policy.document_name);
    const classificationArray = classificationRecords
      .map((classification) => classification.classification_id)
      .map((id) => classifications.find((classification) => classification.id === id));
    const commodityArray = commodityRecords
      .map((commodity) => commodity.commodity_id)
      .map((id) => commodities.find((commodity) => commodity.id === id));
    const geographyArray = geographyRecords
      .map((geography) => geography.geography_id)
      .map((id) => geographies.find((geography) => geography.id === id));

    content.policyNames = policyArray;
    content.arr_org_classification_ids = classificationArray.every(Helper.isUndefined)
      ? []
      : classificationArray.map((classification) => classification.classification_name);
    content.arr_user_commodity_ids = commodityArray.every(Helper.isUndefined)
      ? []
      : commodityArray.map((commodity) => commodity.commmodity_name);
    content.arr_user_geography_ids = geographyArray.every(Helper.isUndefined)
      ? []
      : geographyArray.map((geography) => geography.geography_name);

    // ensure user is a pro manager
    if (!UserManager.isProManager(req)) {
      const userMessage = langResources.getResourceString('userIsNotAnAdmin');
      const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotProManager,
        userMessage,
        sysMessage
      );
    }

    // Activate the account
    const secret = speakEasy.createSecret(req);
    const timestamp = new Date();
    const params = [
      { field: 'PendingAccountID', type: sql.Int, value: pendingAccountId },
      { field: 'UserSecret', type: sql.VarChar(50), value: secret },
      { field: 'ActivatedTime', type: sql.SmallDateTime, value: timestamp },
    ];
    const activationResult = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspActivatePendingAccount',
      params
    );

    try {
      const renewalParams = [
        { field: 'PendingAccountID', type: sql.Int, value: pendingAccountId },
        { field: 'RenewalTime', type: sql.DateTime, value: timestamp },
      ];
      await sqlUtils.executeSystemQuery(setOrganizationRenewalTime, renewalParams);
    } catch (error) {
      logger.error(`Failed setting Organizations.renewal_time`, error);
      throw error;
    }

    const [activationRecord] = activationResult;
    userEmail = activationRecord.ManagerEmail;
    userExists = activationRecord.UserExists;
    orgID = activationRecord.orgID;

    const requestedCountry =
      typeof record.organization_country === 'string' ? record.organization_country.trim() : '';
    if (requestedCountry) {
      const orgDbResult = await sqlUtils.executeSystemQuery(
        'SELECT organization_db FROM dbo.Organizations WHERE id = @orgID',
        [{ field: 'orgID', type: sql.Int, value: orgID }]
      );
      const organizationDatabase = orgDbResult?.[0]?.[0]?.organization_db;

      if (organizationDatabase) {
        const orgScopedReq = {
          ...req,
          session: {
            ...req.session,
            organization_database: organizationDatabase,
          },
        };

        await sqlUtils.executeOrganizationQuery(
          orgScopedReq,
          `IF COL_LENGTH('dbo.AccountProfile', 'country') IS NOT NULL
BEGIN
  UPDATE dbo.AccountProfile
  SET country = @country;
END`,
          [{ field: 'country', type: sql.NVarChar(100), value: requestedCountry }]
        );
      }
    }

    // Move policy
    await PolicyManager.movePolicy(req, pendingAccountId, orgID);

    // Create user if needed
    if (userExists === 0) {
      await awsCognito.createUser(req, userEmail, false, unit_test);
    }

    // Remove pending organization
    const removeParameters = [
      { field: 'pendingaccount_id', type: sql.Int, value: pendingAccountId },
    ];
    await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspRemovePendingOrganization',
      removeParameters
    );

    // Send email
    const subject = 'GFW Pro Account Activated';
    const msg = awsSes.createBodyContent(
      req,
      config.platformVars.emailType.ORGANIZATION_APPROVED,
      content,
      'success'
    );
    await awsSes.sendEmail(req, config.AWSVars.ses.sender, [userEmail], subject, msg);

    return true;
  } catch (error) {
    if (orgID) {
      rollbackUtils.dropDatabase(req, pendingAccountId);
      rollbackUtils.deleteSystemTableRow(req, 'Organizations', orgID, 'id');
      rollbackUtils.deleteSystemTableRow(req, 'UserRoutes', orgID, 'organization_id');
    }
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToActivateAccount,
      'Failed to Activate Account',
      error
    );
  }
};

/**
 * @function updatePendingAccountUser
 * @summary Creates a request for a new account in the database.
 * @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param  {String}   user_id - User id
 * @param  {String}   user_first_name - First Name of the manager (Administrative User)
 * @param  {String}   user_middle_initial - Middle Initial of the manager (Administrative User)
 * @param  {String}   user_last_name - Last Name of the manager (Administrative User)
 * @param  {String}   user_email - Email for the manager (Administrative User)
 * @param  {String}   user_phone - Phone for the manager (Administrative User)
 * @param  {Number}   user_title_id - Title for the manager (Administrative User)
 * @param  {String}   other_title - Title for other title
 * @param  {Array}   arr_user_geography_ids - An array of geography Ids that the user is interested in.
 * @param  {Array}   arr_user_commodity_ids - An array of commodities (ids) that the user in interested in.
 * @return {Promise<Boolean>} True if successful, false otherwise.
 */
export const updatePendingAccountUser = async (
  req,
  user_id,
  user_first_name,
  user_middle_initial,
  user_last_name,
  user_email,
  user_phone,
  user_title_id,
  other_title,
  arr_user_geography_ids,
  arr_user_commodity_ids
) => {
  try {
    // Insert the new user account
    const params = [
      { field: 'userID', type: sql.Int, value: user_id },
      { field: 'firstName', type: sql.NVarChar(35), value: user_first_name },
      { field: 'mi', type: sql.NVarChar(2), value: user_middle_initial },
      { field: 'lastName', type: sql.NVarChar(35), value: user_last_name },
      { field: 'email', type: sql.NVarChar(50), value: user_email },
      { field: 'phone', type: sql.NVarChar(50), value: user_phone },
      { field: 'titleId', type: sql.Int, value: user_title_id },
      { field: 'other_title', type: sql.NVarChar(150), value: other_title },
      { field: 'geography_ids', type: sql.NVarChar(200), value: arr_user_geography_ids.toString() },
      { field: 'commodity_ids', type: sql.NVarChar(200), value: arr_user_commodity_ids.toString() },
    ];
    await sqlUtils.executeSystemStoredProcedure(req, 'uspUpdatePendingAccountUser', params);
    return true;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToUpdatePendingAccountUser,
      'Failed to update pending account user',
      err
    );
  }
};

/**
 * @function closePendingAccount
 * @summary Closes a Pending Account
 * @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number}  pendingAccountId An integer specifying the pending account ID.
 * @return {Promise<boolean>} resolves to true on success, otherwise throws an error object.
 */
export const closePendingAccount = async (req, pendingAccountId) => {
  try {
    const params = [{ field: 'pendingAccountId', type: sql.Int, value: pendingAccountId }];
    const result = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspClosePendingAccount',
      params
    );
    logger.info(`Pending account ${pendingAccountId} closed. ${JSON.stringify(result)}`);
    return true;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeletePendingAccountRequest,
      'Failed to delete pending account request',
      err
    );
  }
};

/**
 * @function deletePendingAccountRequest
 * @summary Deletes a Pending Account
 * @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number}  pendingAccountId An integer specifying the pending account ID.
 * @return {Promise<boolean>} resolves to true on success, otherwise throws an error object.
 */
export const deletePendingAccountRequest = async (req, pendingAccountId) => {
  // Check to make sure the user is a proper pro manager.
  if (!UserManager.isProManager(req)) {
    const userMessage = langResources.getResourceString('userIsNotAnAdmin');
    const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotProManager,
      userMessage,
      sysMessage
    );
  }

  try {
    const params = [{ field: 'PendingAccountID', type: sql.Int, value: pendingAccountId }];
    await sqlUtils.executeSystemStoredProcedure(req, 'uspDeletePendingAccountRequest', params);
    return true;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeletePendingAccountRequest,
      'Failed to delete pending account request',
      err
    );
  }
};

/**
 * @function deleteOrganization
 * @summary Deletes an organization
 * @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @return {Promise} return a promise object. If successful,
 *                   the promise resolves to true, otherwise, an
 *                   an error object is returned in the reject.
 */
export const deleteOrganization = async (req, orgName) => {
  if (!UserManager.isProManager(req)) {
    const userMessage = langResources.getResourceString('userIsNotAnAdmin');
    const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotProManager,
      userMessage,
      sysMessage
    );
  }

  try {
    const params = [{ field: 'orgName', type: sql.NVarChar(200), value: orgName }];
    await sqlUtils.executeSystemStoredProcedure(req, 'uspDeleteOrganization', params);
    return true;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeleteOrganization,
      'Failed to delete organization',
      err
    );
  }
};

/**
 * @function deleteUser
 * @summary Deletes a User from the db
 * @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @return {Promise} return a promise object. If successful,
 *                   the promise resolves to true, otherwise, an
 *                   an error object is returned in the reject.
 */
export const deleteUser = async (req, email) => {
  // Check to make sure the user is a proper pro manager.
  if (!UserManager.isProManager(req)) {
    const userMessage = langResources.getResourceString('userIsNotAnAdmin');
    const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotProManager,
      userMessage,
      sysMessage
    );
  }

  try {
    const params = [{ field: 'email', type: sql.NVarChar(200), value: email }];
    await sqlUtils.executeSystemStoredProcedure(req, 'uspDeleteUser', params);
    return true;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeleteUser,
      'Failed to delete user',
      err
    );
  }
};

/** @function {reactivateAccount}
 * @summary Reactivate account
 * @param {Object} req
 * @param {number} organization_id
 */
export const reactivateAccount = async (req, organization_id) => {
  try {
    const organization_status_id = orgAccountStatus.Active;
    const params = [
      { field: 'organization_id', type: sql.Int, value: organization_id },
      { field: 'organization_status_id', type: sql.Int, value: organization_status_id },
    ];
    await sqlUtils.executeSystemStoredProcedure(req, 'uspSetOrganizationStatus', params);
    return true;
  } catch (err) {
    throw err;
  }
};

/** @function {deactivateAccount}
 * @summary Deactivates account
 * @param {Object} req
 * @param {number} organization_id
 */
export const deactivateAccount = async (req, organization_id) => {
  try {
    // 1. Fetch current organization status
    const orgStatusId = await getOrganizationStatus({ session: { organization_id } }); // pass minimal req object

    if (!orgStatusId) {
      throw {
        code: 'organizationNotFound',
        userMessage: 'Organization not found',
        systemMessage: `Organization ID ${organization_id} not found in DB`,
      };
    }

    // 2. Only allow Active → Inactive
    if (orgStatusId !== orgAccountStatus.Active) {
      throw {
        code: errorUtils.ERROR_CODES.invalidStatusTransition,
        userMessage: 'Only active accounts can be deactivated',
        systemMessage: `Attempted to deactivate organization ${organization_id} with status ${orgStatusId}`,
      };
    }

    // 3. Update status to Inactive
    const updateParams = [
      { field: 'organization_id', type: sql.Int, value: organization_id },
      { field: 'organization_status_id', type: sql.Int, value: orgAccountStatus.Inactive },
    ];
    await sqlUtils.executeSystemStoredProcedure(req, 'uspSetOrganizationStatus', updateParams);
    return true;
  } catch (err) {
    throw {
      code: errorUtils.ERROR_CODES.failedToDeactivateAccount,
      userMessage: 'Failed to deactivate account',
      systemMessage: err,
    };
  }
};

/** @function {getAccountSubscriptionStatus}
 * @summary Get account subscription status
 * @param {Object} request
 * @param {Number} organizationId
 * @returns {Promise<number>}
 */
export const getAccountSubscriptionStatus = async (request, organizationId) => {
  try {
    const parameters = [{ field: 'organizationId', type: sql.Int, value: organizationId }];
    const result = await sqlUtils.executeSystemStoredProcedure(
      request,
      'uspGetOrganizationStatus',
      parameters
    );
    return result;
  } catch (error) {
    throw errorUtils.createErrorMessage(
      request,
      errorUtils.ERROR_CODES.failedToGetAccountSubscriptionStatus,
      `Failed to retrieve account subscription status`,
      error
    );
  }
};

/**
 * @function {updateAccountSubscriptionStatus}
 * @param {Object} request
 * @param {Number} organizationId
 * @param {Number} newSubscriptionStatusId
 * @returns {Promise<boolean>}
 */
export const updateAccountSubscriptionStatus = async (
  request,
  organizationId,
  newSubscriptionStatusId
) => {
  try {
    const parameters = [
      { field: 'organizationId', type: sql.Int, value: organizationId },
      { field: 'subscriptionStatusId', type: sql.Int, value: newSubscriptionStatusId },
    ];
    await sqlUtils.executeSystemStoredProcedure(
      request,
      'uspSetOrganizationSubscriptionStatus',
      parameters
    );
    return true;
  } catch (error) {
    throw errorUtils.createErrorMessage(
      request,
      errorUtils.ERROR_CODES.failedToUpdateAccountSubscriptionStatus,
      `Failed to update account subscription status`,
      error
    );
  }
};

/**
 * @function {updateGlobalAnalysisLimits}
 * @summary Updates AnalysisLimits where OrgType = @subscriptionStatusId
 * @param {Object} request for error util
 * @param {Object} payload params to insert
 * @returns {Promise<payload>}
 */
export const updateGlobalAnalysisLimits = async (request, payload) => {
  const { subscriptionStatusId, MaxAreaPerList, MaxAreaAnalyzeablePerYear, tokens_per_year } =
    payload;
  const params = [
    { field: 'subscriptionStatusId', type: sql.Int, value: subscriptionStatusId },
    { field: 'MaxAreaPerList', type: sql.Decimal, value: MaxAreaPerList },
    { field: 'MaxAreaAnalyzeablePerYear', type: sql.Decimal, value: MaxAreaAnalyzeablePerYear },
    { field: 'tokens_per_year', type: sql.Float, value: tokens_per_year },
  ];

  try {
    await sqlUtils.executeSystemQuery(setGlobalAnalysisLimit, params);

    return payload;
  } catch (error) {
    const errorObject = errorUtils.createErrorMessage(
      request,
      errorUtils.ERROR_CODES.failedToUpdateGlobalAnalysisLimit,
      `Failed to update global analysis limit`,
      error
    );
    throw new Error(errorObject);
  }
};

/**
 * @function {updateAccountAnalysisLimits}
 * @summary Performs an INSERT or UPDATE on Org Limits
 * @param {Object} request for error util
 * @param {Object} payload params to insert
 * @returns {Promise<payload>}
 */
export const updateAccountAnalysisLimits = async (request, payload) => {
  const { organizationId, MaxAreaPerList, MaxAreaAnalyzeablePerYear, tokens_per_year } = payload;
  const params = [
    { field: 'OrgID', type: sql.Int, value: organizationId },
    { field: 'MaxAreaPerList', type: sql.Decimal, value: MaxAreaPerList },
    { field: 'MaxAreaAnalyzeablePerYear', type: sql.Decimal, value: MaxAreaAnalyzeablePerYear },
    { field: 'tokens_per_year', type: sql.Float, value: tokens_per_year },
  ];

  try {
    await sqlUtils.executeSystemQuery(setOrganizationCustomAnalysisLimits, params);

    return payload;
  } catch (error) {
    const errorObject = errorUtils.createErrorMessage(
      request,
      errorUtils.ERROR_CODES.failedToUpdateAccountCustomAnalysisLimits,
      `Failed to update account custom analysis limits`,
      error
    );
    throw new Error(errorObject);
  }
};

/**
 * @function updateOrgName
 * @summary Updates the organization name
 * @param  {Object} req - Request object (used for session/auth)
 * @param  {Number} id - Organization ID
 * @param  {String} name - New organization name
 */
export const updateOrgName = async (req, id, name) => {
  if (!UserManager.isProManager(req)) {
    const userMessage = langResources.getResourceString('userIsNotAnAdmin');
    const sysMessage = `UserEmail: ${req.session.user_email} is not authorized to update org names.`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotProManager,
      userMessage,
      sysMessage
    );
  }

  try {
    const params = [
      { field: 'OrganizationId', type: sql.Int, value: id },
      { field: 'OrganizationName', type: sql.NVarChar, value: name },
    ];

    const [result] = await sqlUtils.executeSystemStoredProcedure(req, 'uspUpdateOrgName', params);

    return result;
  } catch (err) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToUpdateOrganization,
      'Failed to update organization name',
      err
    );
  }
};

/**
 * Check if an organization name is available (not already taken)
 * @returns boolean - true if org name is available, false if taken
 */
export const checkOrgName = async (req, name) => {
  try {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection('gfwpro');
    const orgRepo = connection.getRepository(Organization);
    const organization = await orgRepo
      .createQueryBuilder('org')
      .where('LOWER(org.organization_name) = LOWER(:name)', { name })
      .getOne();

    return !!organization;
  } catch (err) {
    logger.error('checkOrgName error', { err });
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToCheckOrganizationName,
      'Failed to check organization name',
      err
    );
  }
};
