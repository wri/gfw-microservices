const path = require('path');
const sql = require('mssql');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));

/** @function {getDashboardData}
 *   @summary Get function to dashboard data from db for a particular list locations
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
const getDashboardData = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listId', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetDashboardData', parameters)
      .then((dashboardData) => {
        resolve(dashboardData);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to retrieve dashboard data for List ${list_id}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

const getGFWListDashboardData = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listId', type: sql.Int, value: list_id }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetGFWListsDashboardData', parameters)
      .then((dashboardData) => {
        resolve(dashboardData);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to retrieve dashboard data for List ${list_id}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getDashboardTimestamp}
 *   @summary Get Dashboard Timestamp from db for a particular list locations
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
const getDashboardTimestamp = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'timestamp', type: sql.SmallDateTime, value: null },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListsDashboardTimestamp', parameters)
      .then((dashboardData) => {
        resolve(dashboardData);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to retrieve dashboard timestamp for List ${list_id}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getDashboardTimestamp}
 *   @summary Get Dashboard Timestamp from db for a particular GFW list locations
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
const getGFWDashboardTimestamp = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'timestamp', type: sql.SmallDateTime, value: null },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetListsDashboardTimestamp', parameters)
      .then((dashboardData) => {
        resolve(dashboardData);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to retrieve dashboard timestamp for List ${list_id}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

module.exports = {
  getDashboardData,
  getGFWListDashboardData,
  getDashboardTimestamp,
  getGFWDashboardTimestamp,
};
