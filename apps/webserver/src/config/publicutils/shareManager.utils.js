import { getAllListsAnalysisStatus } from '@wri-monorepos/geo';
import { mergeListsWithAnalysisId } from './listManager.utils';

/** ******************************************************************
 *   @name : shareManager.utils.js
 *   @description : A utility file to allow GFW Pro to share
 *                 list data.
 *
 *   @function {shareInternalList}
 *   @function {activateShareInternalList}
 *   @function {deactivateShareInternalList}
 *   @function {getUserInternalShareLists}
 *   @function {getUserPendingInternalShareLists}
 *   @function {getAdminInternalLists}
 *
 ********************************************************************/
// Imports required for this module.
const path = require('path');
const sql = require('mssql');
const langResources = require(path.resolve('./config/langResources'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));

import { getSharedListByUser as getSharedListByUserQuery } from '@wri-monorepos/sql';

/** @function {shareInternalList}
 *  @summary Adding user to internal shared DB table
 *  @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {number} admin_id - The sharing admin's id
 *  @param {number} user_id - Who the list is being shared to
 *  @param {number} list_id - The list of interest
 *  return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const shareInternalList = async (req, admin_id, user_id, list_id) => {
  // Only admins are allowed to share lists
  if (!UserManager.isAdministrator(req)) {
    const errMessage = langResources.getResourceString('userIsNotAnAdmin');
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAdmin,
      errMessage,
      errMessage
    );
  }
  const params = [
    {
      field: 'admin_id',
      type: sql.Int,
      value: admin_id,
    },
    {
      field: 'user_id',
      type: sql.Int,
      value: user_id,
    },
    {
      field: 'list_id',
      type: sql.Int,
      value: list_id,
    },
    {
      field: 'datetime',
      type: sql.DateTime,
      value: new Date(),
    },
  ];
  try {
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspShareInternalList', params);
    return true;
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToShareInternal,
      'Failed request to share list',
      errorMessage
    );
    throw errorObject;
  }
};

/** @function {activateShareInternalList}
 *   @summary Updates pending status of shared list to active
 *   @param {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} admin_id - The sharing admin's id
 *   @param {number} user_id - Who the list is being shared to
 *   @param {number} list_id - The list of interest
 *   @param {Date} datetime - Date list was created
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const activateShareInternalList = async (req, admin_id, user_id, list_id, datetime) => {
  // parameters for stored procedure
  const params = [
    {
      field: 'admin_id',
      type: sql.Int,
      value: admin_id,
    },
    {
      field: 'user_id',
      type: sql.Int,
      value: user_id,
    },
    {
      field: 'list_id',
      type: sql.Int,
      value: list_id,
    },
    {
      field: 'datetime',
      type: sql.DateTime,
      value: datetime,
    },
  ];
  try {
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspActivateShareInternalList', params);
    return true;
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToShareInternal,
      'Failed to activate list share',
      errorMessage
    );
    throw errorObject;
  }
};

/** @function {deactivateShareInternalList}
 *   @summary Remove user from internal shared DB table
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number} user_id - Who the list is being shared to
 *   @param  {number} list_id - The list of interest
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const deactivateShareInternalList = async (req, user_id, list_id) => {
  if (!UserManager.isAdministrator(req)) {
    const errMessage = langResources.getResourceString('userIsNotAnAdmin');
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAdmin,
      errMessage,
      errMessage
    );
  }
  // parameters for stored procedure
  const params = [
    {
      field: 'user_id',
      type: sql.Int,
      value: user_id,
    },
    {
      field: 'list_id',
      type: sql.Int,
      value: list_id,
    },
  ];
  try {
    await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspDeactivateShareInternalList',
      params
    );
    return true;
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToShareInternal,
      'Failed to deactivate list share',
      errorMessage
    );
    throw errorObject;
  }
};

/** @function {deactivateShareInternalList}
 *   @summary Remove all Non Admin or List Owner users from internal shared DB table for selected list
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String} users_id - All Users that list is shared width that are not Admins
 *   @param  {number} list_id - The list of interest
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const deactivateAllShareInternalList = async (req, users_id, list_id) => {
  if (!UserManager.isAdministrator(req)) {
    const errMessage = langResources.getResourceString('userIsNotAnAdmin');
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAdmin,
      errMessage,
      errMessage
    );
  }
  // parameters for stored procedure
  const params = [
    {
      field: 'user_id',
      type: sql.VarChar,
      value: users_id,
    },
    {
      field: 'list_id',
      type: sql.Int,
      value: list_id,
    },
  ];
  try {
    await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspDeactivateAllShareInternalList',
      params
    );
    return true;
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToShareInternal,
      'Failed to deactivate list share',
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * @summary Get shared lists for a specific user
 * @param {Object} req - Request object (with session info)
 * @param {number} user_id - The sharing user's id
 * @returns {Promise<any[]>} List of user shared lists
 */
export const getUserInternalShareLists = async (req, user_id) => {
  // parameters for stored procedure
  const params = [
    {
      field: 'user_id',
      type: sql.Int,
      value: user_id,
    },
  ];
  try {
    return await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetUserInternalShareLists',
      params
    );
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetShared,
      'Failed get user shared lists',
      errorMessage
    );
    throw errorObject;
  }
};

/** @function {getSharedListDataByUser}
 *   @summary Get shared lists for a specific user
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} user_id - The sharing user's id
 *   @return {Promise<>} Returns list of user shared lists
 */
export const getSharedListDataByUser = async (req, user_id) => {
  // parameters for stored procedure
  const params = [
    {
      field: 'userID',
      type: sql.Int,
      value: user_id,
    },
  ];
  try {
    return await sqlUtils.executeOrganizationQuery(req, getSharedListByUserQuery, params);
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetShared,
      'Failed get user shared lists',
      errorMessage
    );
    throw errorObject;
  }
};

export const getSharedListDataByUserWithAnalysisStatus = async (req, user_id) => {
  const [orgLists, listAnalysisStatuses] = await Promise.all([
    getSharedListDataByUser(req, user_id),
    getAllListsAnalysisStatus(req.session.organization_database),
  ]);
  mergeListsWithAnalysisId(orgLists, listAnalysisStatuses);
  return orgLists;
};

/** @function {getUserPendingInternalShareLists}
 *   @summary Get pending shared lists for a specific user
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number} user_id - The sharing user's id
 *   @return {Promise<any[]>} Returns list of user shared lists
 */
export const getUserPendingInternalShareLists = async (req, user_id) => {
  // parameters for stored procedure
  const params = [
    {
      field: 'user_id',
      type: sql.Int,
      value: user_id,
    },
  ];
  try {
    return await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetUserPendingInternalShareLists',
      params
    );
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetShared,
      'Failed get user pending shared lists',
      errorMessage
    );
    throw errorObject;
  }
};

/** @function {adminInternalLists}
 *   @summary Get all shared lists for organization
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise<any[]>} Returns list of all shared lists
 */
export const getAdminInternalLists = async (req) => {
  if (!UserManager.isAdministrator(req)) {
    const errMessage = langResources.getResourceString('userIsNotAnAdmin');
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAdmin,
      errMessage,
      errMessage
    );
  }

  return await sqlUtils.executeOrganizationStoredProcedure(req, 'uspAdminInternalLists');
};

/** @function {adminInternalLists}
 *   @summary Get list of all users from internal shared DB table
 *   @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} list_id -  The list of interest
 *   @return {Promise<any>} Returns all users for shared list
 */
export const getAllUsersForSharedList = async (req, list_id) => {
  if (!UserManager.isAdministrator(req)) {
    const errMessage = langResources.getResourceString('userIsNotAnAdmin');
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAdmin,
      errMessage,
      errMessage
    );
  }
  // parameters for stored procedure
  const params = [
    {
      field: 'list_id',
      type: sql.Int,
      value: list_id,
    },
  ];

  return await sqlUtils.executeOrganizationStoredProcedure(
    req,
    'uspGetUsersInternalShareLists',
    params
  );
};

/**
 * Get User Shared Lists
 * @param {Array} sharedListsRecords - User shared records
 * @param {Array} allLists - All organization lists
 * @returns {Array} - All user shared lists
 */
export const findSharedListsInsideOrganization = (sharedListsRecords, allLists) => {
  if (!Array.isArray(sharedListsRecords) || !Array.isArray(allLists)) {
    return [];
  }

  // Early return if no shared lists
  if (sharedListsRecords.length === 0) {
    return [];
  }

  // Use Set for O(1) lookup instead of O(n) includes()
  const sharedListsSet = new Set(sharedListsRecords.map((list) => list.list_id));
  return allLists.filter((list) => sharedListsSet.has(list.id));
};
