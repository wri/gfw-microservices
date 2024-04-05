/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
/** ******************************************************************
 *   @name: proManager.utils.js
 *   @description : A utility file to allow GFW Pro Managers to login
 *                 to the pro-manager site to review and activate
 *                 pending accounts.
 *   @function {authenticateProUser}
 *   @function {getAllAccountsList}
 *   @function {getAllUsersList}
 *   @function {activatePendingAccount}
 *   @function {updatePendingAccount}
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
const config = require('../config');

const langResources = require(path.resolve('./config/langResources'));
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const Helper = require(path.resolve('./config/publicutils/helper.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const AWSCognito = require(path.resolve('./config/privateutils/cognito.utils'));
const SpeakEasy = require(path.resolve('./config/privateutils/speakeasy.utils'));
const rollbackUtils = require(path.resolve('./config/privateutils/rollback.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const PolicyManager = require(path.resolve('./config/publicutils/policyManager.utils'));
const AccountManager = require(path.resolve('./config/publicutils/accountManager.utils'));
const { setOrganizationCustomAnalysisLimits } = require(path.resolve(
  './queries/system/setOrganizationCustomAnalysisLimits'
));
const { setGlobalAnalysisLimit } = require(path.resolve('./queries/system/setGlobalAnalysisLimit'));
const { orgAccountStatus } = require(path.resolve('./config/env/orgAccountStatus.constants'));
const { setOrganizationRenewalTime } = require('@wri-monorepos/sql');
const logger = require(path.resolve('./config/privateutils/logger.utils'));

/**
 * @function getAllAccountsList
 * @summary Gets an array of All Accounts.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @returns returns an Array of objects, where each object is info on the accounts.
 */
const getAllAccountsList = (req) => {
  return new Promise((resolve, reject) => {
    // Check to make sure the user is a proper pro manager.
    if (!UserManager.isProManager(req)) {
      const userMessage = langResources.getResourceString('loginFailed');
      const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
      const eo = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotProManager,
        userMessage,
        sysMessage
      );
      reject(eo);
    }
    // Get List of pending accounts.
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetAllAccountsList')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetAllAccountsList,
          'Failed to get all accounts list',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * @function getAllUsersList
 * @summary Gets an array of All Users.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @returns returns an Array of objects, where each object is info on the accounts.
 */
const getAllUsersList = (req) => {
  return new Promise((resolve, reject) => {
    // Check to make sure the user is a proper pro manager.
    if (!UserManager.isProManager(req)) {
      const userMessage = langResources.getResourceString('loginFailed');
      const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
      const eo = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotProManager,
        userMessage,
        sysMessage
      );
      reject(eo);
    }
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetAllUsersList')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetAllUsersList,
          'Failed to get all users list',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {activatePendingAccount}
 *   @summary Activates a Pending Account
 *   @param  {Object}  req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number}  pendingaccount_id An integer specifying the pending account ID.
 *   @return {Promise} return a promise obect. If successful,
 *                   the promise resolves to true, otherwise, an
 *                   an error object is returned in the reject.
 */
const activatePendingAccount = (req, pendingaccount_id, unit_test = false) => {
  return new Promise((resolve, reject) => {
    let userID = 0;
    let userEmail = '';
    let userExists = 0;
    let orgID = 0;
    let content = {};
    // Get data for emails
    const titles = UserManager.getTitles(req);
    const commodities = UserManager.getCommodities(req);
    const geographies = UserManager.getGeographies(req);
    const classifications = AccountManager.getClassifications(req);

    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetAllAccountsList')
      .then((recordsets) => {
        const pendingOrganization = recordsets.find(
          (org) =>
            org.organization_id === pendingaccount_id &&
            org.organization_status_id === orgAccountStatus.Pending
        );
        const nonPendingOrganizations = recordsets.filter(
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
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToActivateAccount,
            'Organization name already exists',
            {}
          );
        }
        // if not, grab the pending account info
        const parameters = [
          { field: 'pendingaccount_id', type: sql.Int, value: pendingaccount_id },
        ];
        return sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetPendingAccountInformation',
          parameters
        );
      })
      .then((recordsets) => {
        const [record] = recordsets;
        userID = record.id;
        const titleObject =
          record.title_id === 10
            ? { title: record.other_title }
            : titles.filter((title) => title.id === record.title_id)[0];
        content = {
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
        const userParameters = [{ field: 'pending_user_id', type: sql.Int, value: userID }];
        const orgParameters = [
          { field: 'pending_organization_id', type: sql.Int, value: pendingaccount_id },
        ];
        return Promise.all([
          sqlUtils.executeSystemStoredProcedure(
            req,
            'uspGetPendingUserCommodities',
            userParameters
          ),
          sqlUtils.executeSystemStoredProcedure(
            req,
            'uspGetPendingUserGeographies',
            userParameters
          ),
          sqlUtils.executeSystemStoredProcedure(req, 'uspGetPendingAccountPolicies', orgParameters),
          sqlUtils.executeSystemStoredProcedure(
            req,
            'uspGetPendingAccountClassification',
            orgParameters
          ),
        ]);
      })
      .then((recordsets) => {
        const [commodityRecords, geographyRecords, policyRecords, classificationRecords] =
          recordsets;
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
          const userMessage = langResources.getResourceString('loginFailed');
          const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userNotProManager,
            userMessage,
            sysMessage
          );
        }

        const secret = SpeakEasy.createSecret(req);
        const timestamp = new Date();
        const params = [
          { field: 'PendingAccountID', type: sql.Int, value: pendingaccount_id },
          { field: 'UserSecret', type: sql.VarChar(50), value: secret },
          { field: 'ActivatedTime', type: sql.SmallDateTime, value: timestamp },
        ];
        return sqlUtils
          .executeSystemStoredProcedure(req, 'uspActivatePendingAccount', params)
          .then(async (recordsets) => {
            try {
              const renewalParams = [
                { field: 'PendingAccountID', type: sql.Int, value: pendingaccount_id },
                { field: 'RenewalTime', type: sql.DateTime, value: timestamp },
              ];
              await sqlUtils.executeSystemQuery(setOrganizationRenewalTime, renewalParams);
            } catch (error) {
              logger.error(`Failed setting Organizations.renewal_time`, error);
              throw error;
            }
            return recordsets;
          });
      })
      .then((recordsets) => {
        const [record] = recordsets;
        userEmail = record.ManagerEmail;
        userExists = record.UserExists;
        orgID = record.orgID;
        return PolicyManager.movePolicy(req, pendingaccount_id, orgID);
      })
      .then(() => {
        return userExists === 0 ? AWSCognito.createUser(req, userEmail, false, unit_test) : null;
      })
      .then(() => {
        const parameters = [
          { field: 'pendingaccount_id', type: sql.Int, value: pendingaccount_id },
        ];
        return sqlUtils.executeSystemStoredProcedure(
          req,
          'uspRemovePendingOrganization',
          parameters
        );
      })
      .then(() => {
        const subject = 'GFW Pro Account Activated';
        const msg = AWSSES.createBodyContent(
          req,
          config.platformVars.emailType.ORGANIZATION_APPROVED,
          content,
          'success'
        );
        return AWSSES.sendEmail(req, config.AWSVars.ses.sender, [userEmail], subject, msg);
      })
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        if (orgID) {
          rollbackUtils.dropDatabase(req, pendingaccount_id);
          rollbackUtils.deleteSystemTableRow(req, 'Organizations', orgID, 'id');
          rollbackUtils.deleteSystemTableRow(req, 'UserRoutes', orgID, 'organization_id');
        }
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToActivateAccount,
          'Failed to Activate Account',
          error
        );
        reject(errorObject);
      });
  });
};

/**
 * @DEPRECATED in favor of {publicutils/accountManager.utils.js}
 * @function updatePendingAccount
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
  arr_org_classification_ids,
  policyList,
  policyNames
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
        // Upload policy documents!
        return PolicyManager.uploadPendingPolicies(req, org_id, policyList, policyNames);
      })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdatePendingAccount,
          'Failed to update pending account',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * @function updatePendingAccountUser
 * @summary Creates a request for a new account in the database.
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
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
const updatePendingAccountUser = (
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
  return new Promise((resolve, reject) => {
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
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspUpdatePendingAccountUser', params)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdatePendingAccountUser,
          'Failed to update pending account user',
          err
        );
        reject(errorObject);
      });
  });
};

/**
* @function deletePendingAccountRequest
* @summary Deletes a Pending Account
* @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
* @param {number}  pendingaccount_id An integer specifying the pending account ID.
* @return {Promise} return a promise obect. If successful,

*                   the promise resolves to true, otherwise, an
*                   an error object is returned in the reject.
*/
const deletePendingAccountRequest = (req, pendingaccount_id) => {
  return new Promise((resolve, reject) => {
    // Check to make sure the user is a proper pro manager.
    if (!UserManager.isProManager(req)) {
      const userMessage = langResources.getResourceString('loginFailed');
      const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
      const eo = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotProManager,
        userMessage,
        sysMessage
      );
      reject(eo);
    }
    // Activate Pending Account.
    const params = [{ field: 'PendingAccountID', type: sql.Int, value: pendingaccount_id }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDeletePendingAccountRequest', params)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeletePendingAccountRequest,
          'Failed to delete pending account request',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * @function deleteOrganization
 * @summary Deletes an organization
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return {Promise} return a promise obect. If successful,
 *                   the promise resolves to true, otherwise, an
 *                   an error object is returned in the reject.
 */
const deleteOrganization = (req, orgName) => {
  return new Promise((resolve, reject) => {
    if (!UserManager.isProManager(req)) {
      const userMessage = langResources.getResourceString('loginFailed');
      const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
      const eo = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotProManager,
        userMessage,
        sysMessage
      );
      reject(eo);
    }
    const params = [{ field: 'orgName', type: sql.NVarChar(200), value: orgName }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDeleteOrganization', params)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteOrganization,
          'Failed to delete organization',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * @function deleteUser
 * @summary Deletes a User from the db
 * @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return {Promise} return a promise obect. If successful,
 *                   the promise resolves to true, otherwise, an
 *                   an error object is returned in the reject.
 */
const deleteUser = (req, email) => {
  return new Promise((resolve, reject) => {
    // Check to make sure the user is a proper pro manager.
    if (!UserManager.isProManager(req)) {
      const userMessage = langResources.getResourceString('loginFailed');
      const sysMessage = `UserEmail: ${req.session.user_email} is not a GFW Pro Root User.`;
      const eo = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotProManager,
        userMessage,
        sysMessage
      );
      reject(eo);
    }
    const params = [{ field: 'email', type: sql.NVarChar(200), value: email }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDeleteUser', params)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteUser,
          'Failed to delete user',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {deletePendingAccount}
 * @summary Deletes a pending account
 * @param {Object} req
 * @param {number} organization_id
 */
const deletePendingAccount = (req, organization_id) => {
  const promise = new Promise((resolve, reject) => {
    const params = [{ field: 'PendingAccountID', type: sql.Int, value: organization_id }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspDeletePendingAccountRequest', params)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteOrganization,
          'Failed to delete pending account.',
          err
        );
        reject(errorObject);
      });
  });
  return promise;
};

/** @function {reactivateAccount}
 * @summary Reactivate account
 * @param {Object} req
 * @param {number} organization_id
 */
const reactivateAccount = (req, organization_id) => {
  return new Promise((resolve, reject) => {
    const organization_status_id = orgAccountStatus.Active;
    const params = [
      { field: 'organization_id', type: sql.Int, value: organization_id },
      { field: 'organization_status_id', type: sql.Int, value: organization_status_id },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspSetOrganizationStatus', params)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** @function {deactivateAccount}
 * @summary Deactivates account
 * @param {Object} request
 * @param {number} organization_id
 */
const deactivateAccount = (request, organization_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'organization_id', type: sql.Int, value: organization_id },
      {
        field: 'organization_status_id',
        type: sql.Int,
        value: orgAccountStatus.Inactive,
      },
    ];
    // Promise.all([
    //   sqlUtils.executeSystemStoredProcedure(req, 'uspSetOrganizationStatus', parameters),
    //   sqlUtils.executeSystemStoredProcedure(req, 'uspSetOrganizationUserStatus', parameters)
    // ])
    sqlUtils
      .executeSystemStoredProcedure(request, 'uspSetOrganizationStatus', parameters)
      .then(() => resolve(true))
      .catch((err) => reject(err));
  });
};

/** @function {getAccountSubscriptionStatus}
 * @summary Get account subscription status
 * @param {Object} request
 * @param {Number} organizationId
 * @returns {Promise<number>}
 */
const getAccountSubscriptionStatus = (request, organizationId) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'organizationId', type: sql.Int, value: organizationId }];
    sqlUtils
      .executeSystemStoredProcedure(request, 'uspGetOrganizationStatus', parameters)
      .then((result) => resolve(result))
      .catch((error) => {
        const errorObject = errorUtils.createErrorMessage(
          request,
          errorUtils.errorCodes.failedToGetAccountSubscriptionStatus,
          `Failed to retreive account subscription status`,
          error
        );
        reject(errorObject);
      });
  });
};

/**
 * @function {updateAccountSubscriptionStatus}
 * @param {Object} request
 * @param {Number} organizationId
 * @param {Number} newSubscriptionStatusId
 * @returns {Promise<boolean>}
 */
const updateAccountSubscriptionStatus = async (
  request,
  organizationId,
  newSubscriptionStatusId
) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'organizationId', type: sql.Int, value: organizationId },
      { field: 'subscriptionStatusId', type: sql.Int, value: newSubscriptionStatusId },
    ];
    sqlUtils
      .executeSystemStoredProcedure(request, 'uspSetOrganizationSubscriptionStatus', parameters)
      .then(() => resolve(true))
      .catch((error) => {
        const errorObject = errorUtils.createErrorMessage(
          request,
          errorUtils.errorCodes.failedToUpdateAccountSubscriptionStatus,
          `Failed to update account subscription status`,
          error
        );
        reject(errorObject);
      });
  });
};

/**
 * @function {updateGlobalAnalysisLimits}
 * @summary Updates AnalysisLimits where OrgType = @subscriptionStatusId
 * @param {Object} request for error util
 * @param {Object} payload params to insert
 * @returns {Promise<payload>}
 */
const updateGlobalAnalysisLimits = async (request, payload) => {
  const {
    subscriptionStatusId,
    MaxAreaPerList,
    MaxAreaAnalyzeablePerYear,
    max_locations_per_year,
  } = payload;
  const params = [
    { field: 'subscriptionStatusId', type: sql.Int, value: subscriptionStatusId },
    { field: 'MaxAreaPerList', type: sql.Decimal, value: MaxAreaPerList },
    { field: 'MaxAreaAnalyzeablePerYear', type: sql.Decimal, value: MaxAreaAnalyzeablePerYear },
    { field: 'max_locations_per_year', type: sql.Int, value: max_locations_per_year },
  ];

  try {
    await sqlUtils.executeSystemQuery(setGlobalAnalysisLimit, params);

    return payload;
  } catch (error) {
    const errorObject = errorUtils.createErrorMessage(
      request,
      errorUtils.errorCodes.failedToUpdateGlobalAnalysisLimit,
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
const updateAccountAnalysisLimits = async (request, payload) => {
  const { organizationId, MaxAreaPerList, MaxAreaAnalyzeablePerYear, max_locations_per_year } =
    payload;
  const params = [
    { field: 'OrgID', type: sql.Int, value: organizationId },
    { field: 'MaxAreaPerList', type: sql.Decimal, value: MaxAreaPerList },
    { field: 'MaxAreaAnalyzeablePerYear', type: sql.Decimal, value: MaxAreaAnalyzeablePerYear },
    { field: 'max_locations_per_year', type: sql.Int, value: max_locations_per_year },
  ];

  try {
    await sqlUtils.executeSystemQuery(setOrganizationCustomAnalysisLimits, params);

    return payload;
  } catch (error) {
    const errorObject = errorUtils.createErrorMessage(
      request,
      errorUtils.errorCodes.failedToUpdateAccountCustomAnalysisLimits,
      `Failed to update account custom analysis limits`,
      error
    );
    throw new Error(errorObject);
  }
};

module.exports = {
  getAllAccountsList,
  getAllUsersList,
  activatePendingAccount,
  updatePendingAccount,
  updatePendingAccountUser,
  deletePendingAccountRequest,
  deleteOrganization,
  deleteUser,
  deactivateAccount,
  deletePendingAccount,
  reactivateAccount,
  getAccountSubscriptionStatus,
  updateAccountSubscriptionStatus,
  updateGlobalAnalysisLimits,
  updateAccountAnalysisLimits,
};
