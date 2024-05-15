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
const Q = require('q');
const path = require('path');
const sql = require('mssql');
const langResources = require(path.resolve('./config/langResources'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const UserManager = require(path.resolve('./config/publicutils/userManager.utils'));
const analyticsService = require(path.resolve('./server/analytics/service/analytics.service'));

import { getSharedListByUser as getSharedListByUserQuery } from '@wri-monorepos/sql';

/** @function {shareInternalList}
 *  @summary Adding user to internal shared DB table
 *  @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *  @param {number} admin_id - The sharing admin's id
 *  @param {number} user_id - Who the list is being shared to
 *  @param {number} list_id - The list of interest
 *  return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const shareInternalList = (req, admin_id, user_id, list_id) => {
  let hasError = false;
  const shareInternalListResult = new Promise((resolve, reject) => {
    Q.fcall(() => {
      // Only admins are allowed to share lists
      if (!UserManager.isAdministrator(req)) {
        const errMessage = langResources.getResourceString('userisNotAnAdmin');
        throw new errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.userNotAdmin,
          errMessage,
          errMessage
        );
      } else {
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
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspShareInternalList', params);
      }
    })
      .catch((errorMessage) => {
        hasError = true;
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToShareInternal,
          'Failed request to share list',
          errorMessage
        );
        reject(errorObject);
      })
      .done(() => {
        if (!hasError) {
          resolve(true);
        }
      });
  });
  return shareInternalListResult;
};

/** @function {activateShareInternalList}
 *   @summary Updates pending status of shared list to active
 *   @param {Object}  req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} admin_id - The sharing admin's id
 *   @param {number} user_id - Who the list is being shared to
 *   @param {number} list_id - The list of interest
 *   @param {Date} datetime - Date list was created
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const activateShareInternalList = (req, admin_id, user_id, list_id, datetime) => {
  let hasError = false;
  // Create promise object to return
  const activateShareInternalListResult = new Promise((resolve, reject) => {
    Q.fcall(() => {
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
      return sqlUtils.executeOrganizationStoredProcedure(
        req,
        'uspActivateShareInternalList',
        params
      );
    })
      .catch((errorMessage) => {
        hasError = true;
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToShareInternal,
          'Failed to activate list share',
          errorMessage
        );
        reject(errorObject);
      })
      .done(() => {
        if (!hasError) {
          resolve(true);
        }
      });
  });
  return activateShareInternalListResult;
};

/** @function {deactivateShareInternalList}
 *   @summary Remove user from internal shared DB table
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number} user_id - Who the list is being shared to
 *   @param  {number} list_id - The list of interest
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const deactivateShareInternalList = (req, user_id, list_id) => {
  let hasError = false;
  // Create promise object to return
  const deactivateShareInternalListResult = new Promise((resolve, reject) => {
    Q.fcall(() => {
      if (!UserManager.isAdministrator(req)) {
        const errMessage = langResources.getResourceString('userisNotAnAdmin');
        throw new errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.userNotAdmin,
          errMessage,
          errMessage
        );
      } else {
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
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspDeactivateShareInternalList',
          params
        );
      }
    })
      .catch((errorMessage) => {
        hasError = true;
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToShareInternal,
          'Failed to deactivate list share',
          errorMessage
        );
        reject(errorObject);
      })
      .done(() => {
        if (!hasError) {
          resolve(true);
        }
      });
  });
  return deactivateShareInternalListResult;
};

/** @function {deactivateShareInternalList}
 *   @summary Remove all Non Admin or List Owner users from internal shared DB table for selected list
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String} users_id - All Users that list is shared width that are not Admins
 *   @param  {number} list_id - The list of interest
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const deactivateAllShareInternalList = (req, users_id, list_id) => {
  let hasError = false;
  // Create promise object to return
  const deactivateShareInternalListResult = new Promise((resolve, reject) => {
    Q.fcall(() => {
      if (!UserManager.isAdministrator(req)) {
        const errMessage = langResources.getResourceString('userisNotAnAdmin');
        throw new errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.userNotAdmin,
          errMessage,
          errMessage
        );
      } else {
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
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspDeactivateAllShareInternalList',
          params
        );
      }
    })
      .catch((errorMessage) => {
        hasError = true;
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToShareInternal,
          'Failed to deactivate list share',
          errorMessage
        );
        reject(errorObject);
      })
      .done(() => {
        if (!hasError) {
          resolve(true);
        }
      });
  });
  return deactivateShareInternalListResult;
};

/** @function {getUserInternalShareLists}
 *   @summary Get shared lists for a specific user
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} user_id - The sharing user's id
 *   @return {Promise<any[]>} Returns list of user shared lists
 */
export const getUserInternalShareLists = (req, user_id) => {
  let hasError = false;
  // Create promise object to return
  const getUserInternalShareListsResult = new Promise((resolve, reject) => {
    Q.fcall(() => {
      // parameters for stored procedure
      const params = [
        {
          field: 'user_id',
          type: sql.Int,
          value: user_id,
        },
      ];
      return sqlUtils.executeOrganizationStoredProcedure(
        req,
        'uspGetUserInternalShareLists',
        params
      );
    })
      .catch((errorMessage) => {
        hasError = true;
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetShared,
          'Failed get user shared lists',
          errorMessage
        );
        reject(errorObject);
      })
      .done((recordsets) => {
        if (!hasError) {
          resolve(recordsets);
        }
      });
  });
  return getUserInternalShareListsResult;
};

/** @function {getSharedListDataByUser}
 *   @summary Get shared lists for a specific user
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} user_id - The sharing user's id
 *   @return {Promise<>} Returns list of user shared lists
 */
export const getSharedListDataByUser = (req, user_id) => {
  let hasError = false;
  // Create promise object to return
  return new Promise((resolve, reject) => {
    Q.fcall(() => {
      // parameters for stored procedure
      const params = [
        {
          field: 'userID',
          type: sql.Int,
          value: user_id,
        },
      ];
      return sqlUtils.executeOrganizationQuery(req, getSharedListByUserQuery, params);
    })
      .catch((errorMessage) => {
        hasError = true;
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetShared,
          'Failed get user shared lists',
          errorMessage
        );
        reject(errorObject);
      })
      .done((recordsets) => {
        if (!hasError) {
          resolve(recordsets);
        }
      });
  });
};

export const getSharedListDataByUserWithAnalysisStatus = (req, user_id) => {
  return new Promise((resolve, reject) => {
    const promises = [
      getSharedListDataByUser(req, user_id),
      analyticsService.getAllListsAnalysisStatus(req),
    ];
    Promise.all(promises)
      .then((results) => {
        const [orgLists, listAnalysisStatuses] = results;
        mergeListsWithAnalysisId(orgLists, listAnalysisStatuses);
        resolve(orgLists);
      })
      .catch((error) => reject(error));
  });
};

/** @function {getUserPendingInternalShareLists}
 *   @summary Get pending shared lists for a specific user
 *   @param  {Object}  req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {number} user_id - The sharing user's id
 *   @return {Promise<any[]>} Returns list of user shared lists
 */
export const getUserPendingInternalShareLists = (req, user_id) => {
  let hasError = false;
  // Create promise object to return
  const getUserPendingInternalShareListsResult = new Promise((resolve, reject) => {
    Q.fcall(() => {
      // parameters for stored procedure
      const params = [
        {
          field: 'user_id',
          type: sql.Int,
          value: user_id,
        },
      ];
      return sqlUtils.executeOrganizationStoredProcedure(
        req,
        'uspGetUserPendingInternalShareLists',
        params
      );
    })
      .catch((errorMessage) => {
        hasError = true;
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetShared,
          'Failed get user pending shared lists',
          errorMessage
        );
        reject(errorObject);
      })
      .done((recordsets) => {
        if (!hasError) {
          resolve(recordsets);
        }
      });
  });
  return getUserPendingInternalShareListsResult;
};

/** @function {adminInternalLists}
 *   @summary Get all shared lists for organization
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise<any[]>} Returns list of all shared lists
 */
export const getAdminInternalLists = (req) => {
  let hasError = false;
  // Create promise object to return
  const getAdminInternalListsResult = new Promise((resolve, reject) => {
    Q.fcall(() => {
      if (!UserManager.isAdministrator(req)) {
        const errMessage = langResources.getResourceString('userisNotAnAdmin');
        throw new errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.userNotAdmin,
          errMessage,
          errMessage
        );
      } else {
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspAdminInternalLists');
      }
    })
      .catch((errorMessage) => {
        hasError = true;
        reject(errorMessage);
      })
      .done((recordsets) => {
        if (!hasError) {
          resolve(recordsets);
        }
      });
  });
  return getAdminInternalListsResult;
};

/** @function {adminInternalLists}
 *   @summary Get list of all users from internal shared DB table
 *   @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} list_id -  The list of interest
 *   @return {Promise<any>} Returns all users for shared list
 */
export const getAllUsersForSharedList = (req, list_id) => {
  let hasError = false;
  // Create promise object to return
  return new Promise((resolve, reject) => {
    Q.fcall(() => {
      if (!UserManager.isAdministrator(req)) {
        const errMessage = langResources.getResourceString('userisNotAnAdmin');
        throw new errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.userNotAdmin,
          errMessage,
          errMessage
        );
      } else {
        // parameters for stored procedure
        const params = [
          {
            field: 'list_id',
            type: sql.Int,
            value: list_id,
          },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspGetUsersInternalShareLists',
          params
        );
      }
    })
      .catch((errorMessage) => {
        hasError = true;
        reject(errorMessage);
      })
      .done((recordsets) => {
        if (!hasError) {
          resolve(recordsets);
        }
      });
  });
};

/**
 * Get User Shared Lists
 * @param {Array} sharedListsRecords - User shared records
 * @param {Array} allLists - All organization lists
 * @returns {Array} - All user shared lists
 */
export const findSharedListsInsideOrganization = (sharedListsRecords, allLists) => {
  const sharedListsIDs = sharedListsRecords.map((list) => list.list_id);
  return allLists.filter((list) => sharedListsIDs.includes(list.id));
};
