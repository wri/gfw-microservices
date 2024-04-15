/********************************************************************
 *   @name: error.utils.js
 *   @description: A utility file to allow creating standard error
 *                 messages.
 *   @function {createErrorMessage}
 *
 ********************************************************************/
//Imports required for this module.
const path = require('path');
const logger = require(path.resolve('./config/privateutils/logger.utils'));

const ERROR_CODES = {
  // Authentication
  userNotAdmin: 100,
  userNotEditor: 101,
  userExists: 102,
  userIsDisabled: 103,
  userNotProManager: 104,
  userNotAuthenticated: 105,
  userAlreadyConfirmed: 106,
  userNotFound: 107,
  failedToSetPassword: 108,
  failedToResendVerifyToken: 110,
  // SQL Errors
  failedToCreateConnectionPool: 200,
  failedToExecuteSystemStoredProcedure: 201,
  failedToExecuteOrganizationStoredProcedure: 202,
  failedToExecuteBulkTableProcedure: 203,
  //
  failedToAuthenticate: 109,
  failedToSendEmail: 110,
  // Accounts
  failedToRequestAccount: 300,
  failedToActivateAccount: 301,
  failedToUpdateAccount: 302,
  failedToDeactivateAccount: 303,
  failedToGetAccountProfile: 304,
  failedToUpdatePendingAccount: 305,
  failedToUpdatePendingAccountUser: 306,
  failedToGetAllAccountsList: 308,
  failedToDeletePendingAccountRequest: 309,
  failedToGetAccountSubscriptionStatus: 310,
  failedToUpdateAccountSubscriptionStatus: 311,
  failedToUpdateAccountCustomAnalysisLimits: 312,

  // User
  failedToUpdateUser: 400,
  failedToGetUsersList: 401,
  failedToDeleteUser: 402,
  failedTogetAllUsersList: 403,
  failedToActivateUser: 404,
  failedToDeactiveUser: 405,
  failedToCreateNewUser: 406,
  failedToUpdateUserInfo: 407,
  failedToSetStatus: 408,
  failedToGetUserInfo: 409,
  failedToGetSecret: 410,
  // Organizations
  failedToGetOrganizations: 500,
  failedToDeleteOrganization: 501,
  // Lists and Locations
  failedToCreateList: 600,
  failedToAppendList: 601,
  failedToDeleteList: 603,
  failedToGetList: 604,
  failedToUploadToNewList: 605,
  failedTocopyLocations: 606,
  failedTodeleteLocations: 607,
  failedToUpdateLists: 608,
  failedToMoveLocations: 609,
  failedToGetLockStatus: 610,
  failedToGetAFIAnalysisForListId: 611,
  failedToGetAFINegligibleStatsForListId: 612,
  failedToDeleteListIsNotEmpty: 613,
  // Data
  failedToGetData: 700,
  // Sharing
  failedToShareInternal: 800,
  failedToShareExternal: 801,
  failedToGetShared: 802,
  // Folder
  failedToGetAllFolders: 803,
  failedToGetFolderDetails: 804,
  failedToCreateNewFolder: 805,
  failedToDeleteFolder: 806,
  failedToAddListsToFolder: 807,
  failedToUpdateFolderAccessTime: 808,
  folderDoesNotExist: 809,
  // Dashboard
  failedToGetDashboardAnalysis: 900,
  // Policy
  failedToDownload: 111,
  failedToUploadPolicies: 112,
  failedToUploadPendingPolicies: 113,
  failedToGetPendingPolicyList: 114,
  failedToGetPolicyList: 115,
  failedToDeletePolicies: 116,
  failedToMovePolicies: 117,
  SQSError: 901,
  // Global Limits / Subscription Limits
  failedToUpdateGlobalAnalysisLimit: 1000,
};

/**
 * @function createErrorMessage
 * @summary Creates a new standard error message object that can be used across.
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} error_code - Error Code used for identifying the error.
 * @param {String} user_msg - A message that could be provided to the user if necessary.
 * @param {String} system_msg - The more detailed system message for logging or debugging.
 * @return {Object} An error message object containing the above parameters.
 */
function createErrorMessage(req, error_code, user_msg, system_msg) {
  const objError = {
    errorCode: error_code,
    userMessage: user_msg,
    systemMessage: system_msg,
  };
  // log error
  logger.error('createErrorMessage', objError);
  return objError;
}

function errorHandler(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
    return { status: error.response.status, data: { ...error.response.data } };
  }

  if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
    return {
      status: 500,
      data: { message: 'Error communicating with microservice creating pre-signed URL' },
    };
  }

  // Something happened in setting up the request that triggered an Error
  console.log('Error', error.message);
  return { status: error.response.status, data: { message: error.message } };
}

module.exports = {
  errorCodes: ERROR_CODES,
  createErrorMessage,
  errorHandler,
};
