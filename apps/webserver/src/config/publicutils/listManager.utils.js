/* eslint new-cap: 0 */
/** ******************************************************************
 *   @name : listManager.utils.js
 *   @description : A utility file to allow GFW Pro to obtain/set
 *                 list data.
 *
 * @function {createList}
 * @function {saveAsDraftList}
 * @function {getUserLists}
 * @function {getUserListsWithAnalysisId}
 * @function {rerunExistingList}
 * @function {getAllLists}
 * @function {getListLocations}
 * @function {getSimplifiedListLocations}
 * @function {getDashboardListLocations}
 * @function {getListLocationsNoGeom}
 * @function {getLocationsCount}
 * @function {uploadToExistingList}
 * @function {uploadToNewList}
 * @function {uploadToNewListAndSaveAsDraft}
 * @function {updateIndividualLocationsStatusID}
 * @function {deleteLocations}
 * @function {deleteFilteredLocations}
 * @function {editLocations}
 * @function {copyLocations}
 * @function {moveLocations}
 * @function {getListLockStatus}
 * @function {getListByListName}
 * @function {setListLocked}
 * @function {setListUnlocked}
 * @function {checkListLockStatus}
 * @function {deleteList}
 * @function {resetListStatus}
 * @function {setListStatus}
 * @function {getListStatusCommonName}
 * @function {getLocationIdsFromGeoJSON}
 * @function {getPaginatedAnalysisDataForUserList}
 * @function {getNumberPagesForAnalysisDataUserList}
 * @function {getListLocationGeometry}
 * @function {deleteListIfEmpty}
 * @function {getAllListsWithAnalysisId}
 * @function {getWorstStatusId}
 *
 ******************************************************************* */
// Imports required for this module.
const path = require('path');
const sql = require('mssql');
const _ = require('lodash');

// Configs
const config = require('../config');
const { DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED } = require('../config/locations.config');

// Utils
const Helper = require(path.resolve('./config/publicutils/helper.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const sqsUtils = require(path.resolve('./config/privateutils/sqs.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const listUtils = require(path.resolve('./config/privateutils/list.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const analysisUtils = require(path.resolve('./config/privateutils/analysis.utils'));
const rollbackUtils = require(path.resolve('./config/privateutils/rollback.utils'));
const locationUtils = require(path.resolve('./config/privateutils/location.utils'));
const analyticsService = require(path.resolve('./server/analytics/service/analytics.service'));
const listDataService = require(path.resolve('./server/listData/service/listData.service'));
const { listStatusOrderByWorse } = require(path.resolve('./config/env/listStatuses.constants'));
import { listStatus } from '@wri-monorepos/constants';

/** @function {createList}
 *   @summary Create a new list within Organization DB
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String} list_name
 *   @param  {String} template_id
 *   @param  {String} user_id
 *   @param  {Array{}} custom_attributes
 *   @param  {String} gfw_list_id
 *   @param  {Boolean} is_edit
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const createList = (
  req,
  list_name,
  template_id,
  commodity,
  location_classification,
  user_id,
  custom_attributes,
  gfw_list_id,
  is_edit = false,
  analysisIds = []
) => {
  let list_id = null;
  // Tracking Stored Procedure Executions for rollbacks
  let uspCreateListExecuted = false;
  let uspAddListToAnalysesExecuted = false;
  let uspCreateListTableExecuted = false;
  let uspCreateAnalysisTableExecuted = false;

  // Transform list name
  const list = listUtils.createListNameSchema(list_name);

  const custom_attribute_names = custom_attributes
    ? custom_attributes.map((a) => a.column_name).toString()
    : [];
  const custom_attribute_types = custom_attributes
    ? custom_attributes.map((a) => a.column_type).toString()
    : [];

  // When creating new list, status is always pending.
  const list_status_id = listStatus.Pending;

  return new Promise((resolve, reject) => {
    // Parameters for stored procedure
    const parameters = [
      { field: 'user_id', type: sql.Int, value: user_id },
      { field: 'template_id', type: sql.Int, value: template_id },
      { field: 'list_name', type: sql.NVarChar(150), value: list.list_name },
      { field: 'list_table_name', type: sql.NVarChar(150), value: list.list_table },
      { field: 'list_analysis_table_name', type: sql.NVarChar(150), value: list.analysis_table },
      { field: 'list_status_id', type: sql.Int, value: list_status_id },
      { field: 'location_classification', type: sql.NVarChar(150), value: location_classification },
      { field: 'custom_attribute_names', type: sql.NVarChar(2000), value: custom_attribute_names },
      { field: 'custom_attribute_types', type: sql.NVarChar(2000), value: custom_attribute_types },
      { field: 'associated_gfwlist', type: sql.TinyInt, value: gfw_list_id },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspCreateList', parameters)
      .then((recordsets) => {
        // Previous Stored Procedure executed
        uspCreateListExecuted = true;

        // Grabbing list id
        list_id = recordsets[0].list_id;

        // After the list has been created, insert row into [clientstore].[dbo].[Analyses]
        const params = [{ field: 'list_id', type: sql.Int, value: list_id }];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspAddListToAnalyses', params);
      })
      .then(() => {
        // Set previously executed stored procedure to true
        uspAddListToAnalysesExecuted = true;

        // Create table query String
        const params = [{ field: 'template_id', type: sql.NVarChar(150), value: template_id }];
        for (let i = 0; i < custom_attributes.length; i++) {
          const columnNameParameter = {
            field: `custom_attribute_${i + 1}`,
            type: sql.NVarChar(50),
          };

          if (Helper.isUndefined(custom_attributes[i].column_name)) {
            columnNameParameter.value = null;
          } else {
            columnNameParameter.value = custom_attributes[i].column_name;
          }
          const columnTypeParameter = {
            field: `custom_attribute_${i + 1}_type`,
            type: sql.NVarChar(50),
            value: custom_attributes[i].column_type || null,
          };
          if (Helper.isUndefined(custom_attributes[i].column_type)) {
            columnTypeParameter.value = null;
          } else {
            columnTypeParameter.value = custom_attributes[i].column_type;
          }
          params.push(columnNameParameter);
          params.push(columnTypeParameter);
        }
        return sqlUtils.executeSystemStoredProcedure(req, 'uspGetTableQueryString', params);
      })
      .then((recordsets) => {
        const params = [
          { field: 'table_name', type: sql.NVarChar(150), value: list.list_table },
          { field: 'query_string', type: sql.NVarChar(sql.MAX), value: recordsets[0].query_string },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspCreateListTable', params);
      })
      .then(() => {
        // Previous Stored Procedure executed
        uspCreateListTableExecuted = true;

        // create the corresponding analysis table
        const params = [
          {
            field: 'list_analysis_table_name',
            type: sql.NVarChar(150),
            value: list.analysis_table,
          },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspCreateAnalysisTable', params);
      })
      .then(() => {
        // Previous Stored Procedure executed
        uspCreateAnalysisTableExecuted = true;
        return listDataService.setSelectedAnalyses(req, list_id, analysisIds);
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListCreated,
          `User '${req.session.user_email}' has created a list (${list.list_name}) - (${list_id}).`
        );
        resolve(list_id);
      })

      .catch((errorMessage) => {
        // Call appropriate rollbacks
        if (uspCreateListExecuted) {
          rollbackUtils.deleteOrganizationTableRow(req, 'Lists', list_id, 'id');
        }
        if (uspAddListToAnalysesExecuted) {
          rollbackUtils.deleteOrganizationTableRow(req, 'Analyses', list_id, 'list_id');
        }
        if (uspCreateListTableExecuted) {
          rollbackUtils.dropOrganizationTable(req, list.list_table);
        }
        if (uspCreateAnalysisTableExecuted) {
          rollbackUtils.dropOrganizationTable(req, list.analysis_table);
          rollbackUtils.deleteOrganizationTableRow(req, 'ListsAnalysisStatus', list_id, 'ListID');
        }

        // Create Error Object and reject the error
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToCreateList,
          `Failed to create ${list.list_name}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * Save as Draft List
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} list_name - List name (eg. 'Recent Cocoa Generic 35')
 * @param {number} template_id - List template ID (eg. 13)
 * @param {string} location_classification - Location Classification (eg. 'property')
 * @param {number} user_id - User ID of user that is creating list (eg. 1)
 * @param {Object[]} custom_attributes - List of objects with custom_attributes (name and type)
 * @param {string} gfw_list_id - The ID of the GFW List that this new list is associated with
 * @return {Promise<unknown>}
 */
const saveAsDraftList = (
  req,
  list_name,
  template_id,
  location_classification,
  user_id,
  custom_attributes,
  gfw_list_id,
  analysisIds = []
) => {
  let list_id = null;
  // Tracking Stored Procedure Executions for rollbacks
  let uspCreateListExecuted = false;
  let uspAddListToAnalysesExecuted = false;
  let uspCreateListTableExecuted = false;
  let uspCreateAnalysisTableExecuted = false;

  // Transform list name
  const list = listUtils.createListNameSchema(list_name);

  const custom_attribute_names = custom_attributes
    ? custom_attributes.map((a) => a.column_name).toString()
    : [];
  const custom_attribute_types = custom_attributes
    ? custom_attributes.map((a) => a.column_type).toString()
    : [];
  // When creating new list, status is always Draft when we Save as Draft list
  const list_status_id = listStatus.Draft;

  return new Promise((resolve, reject) => {
    // Parameters for stored procedure
    const parameters = [
      { field: 'user_id', type: sql.Int, value: user_id },
      { field: 'template_id', type: sql.Int, value: template_id },
      { field: 'list_name', type: sql.NVarChar(150), value: list.list_name },
      { field: 'list_table_name', type: sql.NVarChar(150), value: list.list_table },
      { field: 'list_analysis_table_name', type: sql.NVarChar(150), value: list.analysis_table },
      { field: 'list_status_id', type: sql.Int, value: list_status_id },
      { field: 'location_classification', type: sql.NVarChar(150), value: location_classification },
      { field: 'custom_attribute_names', type: sql.NVarChar(2000), value: custom_attribute_names },
      { field: 'custom_attribute_types', type: sql.NVarChar(2000), value: custom_attribute_types },
      { field: 'associated_gfwlist', type: sql.TinyInt, value: gfw_list_id },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspCreateList', parameters)
      .then((recordsets) => {
        // Previous Stored Procedure executed
        uspCreateListExecuted = true;

        // Grabbing list id
        list_id = recordsets[0].list_id;

        // After the list has been created, insert row into [clientstore].[dbo].[Analyses]
        const params = [{ field: 'list_id', type: sql.Int, value: list_id }];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspAddListToAnalyses', params);
      })
      .then(() => {
        // Set previously executed stored procedure to true
        uspAddListToAnalysesExecuted = true;

        // Create table query String
        const params = [{ field: 'template_id', type: sql.Int, value: template_id }];
        for (let i = 0; i < custom_attributes.length; i++) {
          const columnNameParameter = {
            field: `custom_attribute_${i + 1}`,
            type: sql.NVarChar(50),
          };
          if (Helper.isUndefined(custom_attributes[i].column_name)) {
            columnNameParameter.value = null;
          } else {
            columnNameParameter.value = custom_attributes[i].column_name;
          }

          const columnTypeParameter = {
            field: `custom_attribute_${i + 1}_type`,
            type: sql.NVarChar(50),
            value: custom_attributes[i].column_type || null,
          };
          if (Helper.isUndefined(custom_attributes[i].column_type)) {
            columnTypeParameter.value = null;
          } else {
            columnTypeParameter.value = custom_attributes[i].column_type;
          }

          params.push(columnNameParameter);
          params.push(columnTypeParameter);
        }
        return sqlUtils.executeSystemStoredProcedure(req, 'uspGetTableQueryString', params);
      })
      .then((recordsets) => {
        const params = [
          { field: 'table_name', type: sql.NVarChar(150), value: list.list_table },
          { field: 'query_string', type: sql.NVarChar(sql.MAX), value: recordsets[0].query_string },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspCreateListTable', params);
      })
      .then(() => {
        // Previous Stored Procedure executed
        uspCreateListTableExecuted = true;

        // create the corresponding analysis table
        const params = [
          {
            field: 'list_analysis_table_name',
            type: sql.NVarChar(150),
            value: list.analysis_table,
          },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspCreateAnalysisTable', params);
      })
      .then(() => {
        // Previous Stored Procedure executed
        uspCreateAnalysisTableExecuted = true;
        return listDataService.setSelectedAnalyses(req, list_id, analysisIds, listStatus.Draft);
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListCreated,
          `User '${req.session.user_email}' has created a list (${list.list_name}).`
        );
        resolve(list_id);
      })
      .catch((errorMessage) => {
        // Call appropriate rollbacks
        if (uspCreateListExecuted) {
          rollbackUtils.deleteOrganizationTableRow(req, 'Lists', list_id, 'id');
        }
        if (uspAddListToAnalysesExecuted) {
          rollbackUtils.deleteOrganizationTableRow(req, 'Analyses', list_id, 'list_id');
        }
        if (uspCreateListTableExecuted) {
          rollbackUtils.dropOrganizationTable(req, list.list_table);
        }
        if (uspCreateAnalysisTableExecuted) {
          rollbackUtils.dropOrganizationTable(req, list.analysis_table);
          rollbackUtils.deleteOrganizationTableRow(req, 'ListsAnalysisStatus', list_id, 'ListID');
        }

        // Create Error Object and reject the error
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToCreateList,
          `Failed to create ${list.list_name}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getUserLists}
 *   @summary Function to returns list names tied to a user
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getUserLists = (req) => {
  return new Promise((resolve, reject) => {
    let promise;
    const parameters = [];
    // A Super Admin or an Organization Admin are able to view all lists
    if (
      req.session.ispromanager ||
      req.session.user_access_level_id === config.platformVars.accessLevel.Administrator
    ) {
      promise = sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetAllLists');
    } else {
      parameters.push({
        field: 'user_id',
        type: sql.Int,
        value: req.session.organization_user_id,
      });
      promise = sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetUserLists', parameters);
    }
    promise
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get lists for user',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

const mergeListsWithAnalysisId = (lists, listAnalysisStatuses) => {
  lists.forEach((list) => {
    const listAnalysesStatus = listAnalysisStatuses.filter(
      (analysis) => analysis.listId == list.id
    );

    // get the worst status from the list analysis status to replace list level status
    const worstStatus = getWorstStatusId(listAnalysesStatus);

    list.listAnalysesStatus = listAnalysesStatus;
    // replace the list level status with the worst from the list analysis status,
    // or continue with the one that already had.
    list.list_status_id = worstStatus ?? list.list_status_id;
  });
};

const getUserListsWithAnalysisId = (req) => {
  return new Promise((resolve, reject) => {
    const promises = [getUserLists(req), analyticsService.getAllListsAnalysisStatus(req)];

    Promise.all(promises)
      .then((results) => {
        const [userLists, listAnalysisStatuses] = results;
        mergeListsWithAnalysisId(userLists, listAnalysisStatuses);
        resolve(userLists);
      })
      .catch((error) => reject(error));
  });
};

/**
 * @summary Creates location analyses messages
 * @param {Integer} locationId
 * @param {Object} req Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} session
 * @return {Object} Returns an object containing all the info necessary for successfull processing of location based analyses
 */
const createLocationMessages = (locationId, req, session) => {
  return {
    AnalysisTable: req.body.list_analysis_table_name,
    Analyses: [],
    Database: session.organization_database,
    Environment: process.env.NODE_ENV,
    ListName: req.body.list_name,
    ListTable: req.body.list_table_name,
    LocationId: locationId,
    Retries: 0,
    UserEmail: session.user_email,
    FirstName: session.user_first_name,
    LastName: session.user_last_name,
    UserId: session.organization_user_id,
    OrganizationId: session.organization_id,
  };
};

/** @function {rerunExistingList}
 *   @summary Function to rerun location and list analyses
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const rerunExistingList = (req) => {
  return new Promise((resolve, reject) => {
    console.log('listManager --->>> rerunExistingList');
    const { list_id, list_name, list_locations_count } = req.body;
    const { organization_database } = req.session;

    // Returns list_name, list_table, analysis_table
    const list = listUtils.createListNameSchema(list_name);
    analysisUtils
      .analyzeList(req, organization_database, list)
      .then(async () => {
        // Set list status ID to Pending
        await setListStatus(req, list_id, listStatus.Pending);

        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListAnalyzing,
          `Rerun process has started for ${list_locations_count} locations in ${list_name}`
        );

        resolve();
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to run the re-run stored procedure...',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getAllLists}
 *   @summary Function to returns all the list names tied to the organization.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getAllLists = (req) => {
  return new Promise((resolve, reject) => {
    // call organizational stored procedure to return all lists tied to the organization.
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetAllLists')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get all lists for the organization.',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

const getAllListsWithAnalysisId = (req) => {
  return new Promise((resolve, reject) => {
    const promises = [getAllLists(req), analyticsService.getAllListsAnalysisStatus(req)];

    Promise.all(promises)
      .then((results) => {
        const [orgLists, listAnalysisStatuses] = results;
        mergeListsWithAnalysisId(orgLists, listAnalysisStatuses);
        resolve(orgLists);
      })
      .catch((error) => reject(error));
  });
};

const getWorstStatusId = (analysisIds) => {
  // get all status from the analysis list
  const analysisStatus = analysisIds.map((analysisId) => analysisId.status);

  // iterate over status ordered by worse to better and return
  // the fist that exist inside the analysis list
  for (const status of listStatusOrderByWorse) {
    if (analysisStatus.includes(status)) {
      return status;
    }
  }
  return undefined;
};

/** @function {getListLocations}
 *   @summary Get function to return geojson of locations for a particular list.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @param  {Array} list_id - Unique list of location IDs.
 *   @param  {Integer} location_id - Unique list id of the list.
 *   @param  {Integer} rowsRequested
 *   @return {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
const getListLocations = (
  req,
  list_id,
  location_id = 0,
  rowsRequested = DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED
) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'listID', type: sql.Int, value: list_id },
      { field: 'locationID', type: sql.Int, value: location_id },
      { field: 'rowsRequested', type: sql.Int, value: rowsRequested },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListLocations', parameters)
      .then((recordsets) => {
        if (recordsets) {
          const geojson = locationUtils.createGeoJSON(req, recordsets);
          resolve(geojson);
        } else {
          const errorObject = errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToGetList,
            `Failed to get list locations for List ${list_id}`,
            JSON.stringify({ errorLocation: 'getListLocations()' })
          );
          reject(errorObject);
        }
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get list locations for List ${list_id}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getSimplifiedListLocations}
 *   @summary Get function to return simplified geojson of locations for a particular list.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
const getSimplifiedListLocations = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listID', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetSimplifiedListLocations', parameters)
      .then((recordsets) => {
        const geojson = locationUtils.createGeoJSON(req, recordsets);
        resolve(geojson);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get list locations for List ${list_id}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

const getDashboardListLocations = (req, list) => {
  return new Promise((resolve, reject) => {
    const { id, template_id } = list;
    const parameters = [{ field: 'listId', type: sql.Int, value: id }];
    const storedProcedure =
      template_id === 1
        ? 'uspGetDashboardInvestmentLocations'
        : 'uspGetDashboardCommodityLocations';
    Promise.all([
      sqlUtils.executeOrganizationStoredProcedure(req, storedProcedure, parameters),
      sqlUtils.executeOrganizationStoredProcedure(
        req,
        'uspGetDashboardDissolvedS3Location',
        parameters
      ),
    ])
      .then((results) => {
        const [locationRecordsets, s3Recordsets] = results;
        const geojson = locationUtils.createGeoJSON(req, locationRecordsets);
        const location_s3_info = JSON.parse(s3Recordsets[0].dissolved_data_location_info);
        resolve({
          geojson,
          location_s3_info,
        });
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get list locations for List ${id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * @function {getListLocationsNoGeom}
 * @summary Get function to return json of location metadata without geometry.
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Integer} listID - Unique list id of the list.
 * @param {String} columnsToReturn - Comma separated list of columns to return.
 * @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getListLocationsNoGeom = (req, listID, columnsToReturn = null) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'ColumnsToReturn', type: sql.NVarChar, value: columnsToReturn },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListLocationsNoGeom', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get list location (no Geom) for List ${listID}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @typedef {Object} Filters
 * @param {string} country - Country name (e.g. 'Brazil')
 * @param {string} state - State name (e.g. 'Bahia')
 * @param {string} state - SubState name (e.g. 'Barreiras')
 * @param {number} page - Page number (e.g. 1)
 * @param {number} pageSize - Number of rows per page (e.g. 50)
 * @param {string} orderType - Sort order (e.g. 'asc' or 'desc')
 * @param {number} analysisAreaMax - Maximum analysis area (e.g. 1000)
 * @param {number} analysisAreaMin - Minimum analysis area (e.g. 0)
 * @param {string} columnsToReturn - Columns to return (e.g. 'Location Name,Commodity,State,Certification')
 * @param {string} LocationIds - Location ids to filter by (e.g. '1,2,3' or '1 AND 5, 6 AND 10' )
 * @param {string} LocationLogic - Location logic to filter by (e.g. 'IN', 'NOT IN' or 'BETWEEN')
 */

/**
 * @function {getPaginatedAnalysisDataForUserList}
 * @summary Get function to return json of paginated location metadata with geometry.
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Integer} listID - Unique list id of the list.
 * @param {Filters} filters - Array of filters to apply to the query.
 * @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getPaginatedAnalysisDataForUserList = (req, listID, filters) => {
  let { searchString, country, state, subState } = filters;
  const {
    page,
    pageSize,
    orderType,
    sortByAttribute,
    analysisAreaMax,
    analysisAreaMin,
    columnsToReturn = null,
    LocationIds = null,
    LocationLogic = null,
    selectedSupplier,
    selectedSecondSupplier,
    selectedParentCompany,
    showRSPOCertified,
    selectedOverallThreats,
    selectedOverallValues,
    selectedMillPriority,
    LocationStatement = null,
    geometry = 0,
  } = filters;

  if (LocationIds) {
    searchString = null;
    country = null;
    state = null;
    subState = null;
  }

  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'PageNumber', type: sql.Int, value: page || null },
      { field: 'RowsOfPage', type: sql.Int, value: pageSize || null },
      { field: 'OrderByColumn', type: sql.NVarChar(255), value: sortByAttribute || null },
      { field: 'Order', type: sql.NVarChar, value: orderType || null },
      { field: 'SearchString', type: sql.NVarChar, value: searchString || null },
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
      { field: 'analysisAreaMin', type: sql.Int, value: analysisAreaMin || null },
      { field: 'analysisAreaMax', type: sql.Int, value: analysisAreaMax || null },
      { field: 'ColumnsToReturn', type: sql.NVarChar, value: columnsToReturn },
      { field: 'LocationIds', type: sql.NVarChar, value: LocationIds },
      { field: 'LocationLogic', type: sql.NVarChar, value: LocationLogic },
      { field: 'LocationStatement', type: sql.NVarChar, value: LocationStatement || null },
      { field: 'Geometry', type: sql.Bit, value: geometry || 0 },
      // commodity risk filters
      { field: 'selectedSupplier', type: sql.NVarChar, value: selectedSupplier || null },
      {
        field: 'selectedSecondSupplier',
        type: sql.NVarChar,
        value: selectedSecondSupplier || null,
      },
      { field: 'selectedParentCompany', type: sql.NVarChar, value: selectedParentCompany || null },
      { field: 'showRSPOCertified', type: sql.Bit, value: showRSPOCertified || null },
      {
        field: 'selectedOverallThreats',
        type: sql.NVarChar,
        value: JSON.stringify(selectedOverallThreats) || null,
      },
      {
        field: 'selectedOverallValues',
        type: sql.NVarChar,
        value: JSON.stringify(selectedOverallValues) || null,
      },
      {
        field: 'selectedMillPriority',
        type: sql.NVarChar,
        value: JSON.stringify(selectedMillPriority) || null,
      },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetPaginatedAnalysisDataForUserList', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get paginated list location for List ${listID}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getNumberPagesForAnalysisDataUserList}
 *   @summary Get function to return the number of pages for the paginated analysis data for a user list.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @param  {Integer} rowsPerPage - Number of rows per page.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getNumberPagesForAnalysisDataUserList = (req, list_id, filters) => {
  return new Promise((resolve, reject) => {
    const {
      pageSize,
      searchString,
      country,
      state,
      subState,
      analysisAreaMax,
      analysisAreaMin,
      selectedSupplier,
      selectedSecondSupplier,
      selectedParentCompany,
      showRSPOCertified,
      selectedOverallThreats,
      selectedOverallValues,
      selectedMillPriority,
    } = filters;
    const parameters = [
      { field: 'listID', type: sql.Int, value: list_id },
      { field: 'searchString', type: sql.NVarChar, value: searchString || null },
      { field: 'Country', type: sql.NVarChar, value: country || null },
      { field: 'State', type: sql.NVarChar, value: state || null },
      { field: 'SubState', type: sql.NVarChar, value: subState || null },
      { field: 'analysisAreaMin', type: sql.Int, value: analysisAreaMin || null },
      { field: 'analysisAreaMax', type: sql.Int, value: analysisAreaMax || null },
      // commodity risk filters
      { field: 'selectedSupplier', type: sql.NVarChar, value: selectedSupplier || null },
      {
        field: 'selectedSecondSupplier',
        type: sql.NVarChar,
        value: selectedSecondSupplier || null,
      },
      { field: 'selectedParentCompany', type: sql.NVarChar, value: selectedParentCompany || null },
      { field: 'showRSPOCertified', type: sql.Bit, value: showRSPOCertified || null },
      {
        field: 'selectedOverallThreats',
        type: sql.NVarChar,
        value: JSON.stringify(selectedOverallThreats) || null,
      },
      {
        field: 'selectedOverallValues',
        type: sql.NVarChar,
        value: JSON.stringify(selectedOverallValues) || null,
      },
      {
        field: 'selectedMillPriority',
        type: sql.NVarChar,
        value: JSON.stringify(selectedMillPriority) || null,
      },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetAnalysisDataCountForUserList', parameters)
      .then((recordsets) => {
        const totalRows = recordsets.find(
          (record) => record.statistic_type === 'Row Count'
        ).statistic;
        const maximumAnalysisAreaInTheList = recordsets.find(
          (record) => record.statistic_type === 'Max Area'
        ).statistic;
        let numberOfPages = 2;
        if (totalRows) {
          numberOfPages = pageSize ? Math.ceil(totalRows / pageSize) : 1;
        }
        resolve({
          numberOfPages,
          numberOfResults: totalRows,
          maximumAnalysisAreaInTheList,
        });
      })

      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get number of pages for List ${list_id}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getLocationsCount}
 *   @summary Get function to return geojson of list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getLocationsCount = (req) => {
  return new Promise((resolve, reject) => {
    let promise;
    // Retrieve user access level
    const { user_access_level_id, organization_database, organization_user_id } = req.session;
    const parameters = [
      { field: 'org_db', type: sql.NVarChar, value: req.session.organization_database },
    ];
    if (user_access_level_id === config.platformVars.accessLevel.Administrator) {
      promise = sqlUtils.executeSystemStoredProcedure(req, 'uspGetLocationsCount', parameters);
    } else {
      parameters.push({ field: 'user_id', type: sql.Int, value: organization_user_id });
      promise = sqlUtils.executeSystemStoredProcedure(
        req,
        'uspGetLocationsCountEditor',
        parameters
      );
    }
    promise
      .then((recordsets) => {
        const [record] = recordsets;
        resolve(record);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetLocationsCount,
          'Failed to get list locations count',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {uploadToExistingList}
 *   @summary Adds location and attributes to existing list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number} list_id
 *   @param  {String} list_name
 *   @param  {Object} geojson - a geojson object with array of features that contain geometry and properties
 *   @return
 */
const uploadToExistingList = (req, list_id, list_name, geojson, commodity) => {
  return new Promise((resolve, reject) => {
    listUtils
      .uploadBulkLocations(req, list_id, list_name, geojson, commodity)
      .then((geojson) => {
        resolve(geojson);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** @function {uploadToNewList}
 *   @summary Creates new list and table, then performs uploadToExistingList
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id
 *   @param {Number} template_id
 *   @param {Array{}} custom_attributes - array of objects with custom_attributes (name and type)
 *   @param {Object} geojson
 *   @param {String} gfw_list_id - The ID of the GFW List that this new list is associated with
 *   @param {Boolean} is_edit - Boolean to check if this call has been initiated by an edit list function
 *   @return
 */
const uploadToNewList = (
  req,
  list_name,
  template_id,
  commodity,
  location_classification,
  organization_id,
  custom_attributes,
  geojson,
  gfw_list_id,
  is_edit = false,
  analysisIds
) => {
  const user_id = req.session.organization_user_id;
  const list = listUtils.createListNameSchema(list_name);
  let newListID;

  return new Promise((resolve, reject) => {
    createList(
      req,
      list_name,
      template_id,
      commodity,
      location_classification,
      user_id,
      custom_attributes,
      gfw_list_id,
      is_edit,
      analysisIds
    )
      .then((list_id) => {
        newListID = list_id;
        return uploadToExistingList(req, list_id, list_name, geojson, commodity);
      })
      .then((resultGeoJSON) => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUpdateNew,
          `User '${req.session.user_email}' has uploaded to new list (${list.list_name}).`
        );
        resolve({ resultGeoJSON, newListID });
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUploadToNewList,
          `Failed to append to upload new list ${list.list_name}.`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {uploadToNewListAndSaveAsDraft}
 *   @summary Creates new list and table when user Save list as Draft
 *   @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {string} list_name - List name (eg. 'Recent Cocoa Generic 35')
 *   @param {number} template_id - List template ID (eg. 13)
 *   @param commodity
 *   @param {string} location_classification - Location Classification (eg. 'property')
 *   @param {array} custom_attributes - array of objects with custom_attributes (name and type)
 *   @param {object} geojson - Feature Collection geometries of all locations
 *   @param {string} gfw_list_id - The ID of the GFW List that this new list is associated with
 *   @return {Promise}
 */
const uploadToNewListAndSaveAsDraft = (
  req,
  list_name,
  template_id,
  commodity,
  location_classification,
  custom_attributes,
  geojson,
  gfw_list_id,
  analysisIds
) => {
  const { original_gfw_list } = req.body;
  const user_id = req.session.organization_user_id;
  const list = listUtils.createListNameSchema(list_name);
  let listID;

  return new Promise((resolve, reject) => {
    saveAsDraftList(
      req,
      list_name,
      template_id,
      location_classification,
      user_id,
      custom_attributes,
      gfw_list_id,
      analysisIds
    )
      .then((list_id) => {
        listID = list_id;
        return uploadToExistingList(req, list_id, list_name, geojson, commodity);
      })
      .then(async (geojson) => {
        // Getting list analysis table name
        const { analysis_table } = listUtils.createListNameSchema(list_name);

        // Getting locations IDs
        const locationsIDs = getLocationIdsFromGeoJSON(geojson);

        if (!original_gfw_list) {
          // Changing all locations status IDs to be Draft
          await updateIndividualLocationsStatusID(
            req,
            analysis_table,
            locationsIDs,
            listStatus.Draft
          );
        }

        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUpdateNew,
          `User '${req.session.user_email}' has uploaded to new list (${list.list_name}).`
        );
        resolve({ resultGeoJSON: geojson, newListID: listID });
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUploadToNewList,
          `Failed to append to upload new list ${list.list_name}.`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * Update Individual Locations Status ID
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {string} list_analysis_table_name - List analysis table name (eg. "analysis-recentcocoageneric9")
 * @param {string || number || string[] || number[] } location_id - Location status id or ids - (eg. 9 || [8, 9, 10] )
 * @param {number } location_status_id - Location status ID (eg. 4)
 * @return {Promise}
 */
const updateIndividualLocationsStatusID = (
  req,
  list_analysis_table_name,
  location_id,
  location_status_id
) => {
  return new Promise((resolve, reject) => {
    const sqlParameters = [
      { field: 'analysis_table_name', type: sql.NVarChar(150), value: list_analysis_table_name },
      { field: 'location_ids_array', type: sql.NVarChar, value: location_id.toString() },
      { field: 'location_status_id', type: sql.Int, value: location_status_id },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(
        req,
        'uspUpdateLocationAnalysisStatusInBulk',
        sqlParameters
      )
      .then((result) => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUpdateNew,
          `User '${
            req.session.user_email
          }' has updated list analysis table (${list_analysis_table_name}) locations IDs (${location_id.toString()}) with location status ID (${location_status_id}).`
        );
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUploadToNewList,
          `Updating list locations status IDs failed for analysis table (${list_analysis_table_name}).`,
          errorMessage
        );
        reject('Update Individual Locations Status ID FAILED');
      });
  });
};

/** @function {deleteLocations}
 *   @summary Deletes locations from a list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id
 *   @param {Array} location_ids
 *   @param  {Number} gfw_list_id
 *   @return {Promise}
 */
const deleteLocations = (req, list_id, location_ids, gfw_list_id) => {
  let promiseResolver = Promise.resolve();
  return new Promise((resolve, reject) => {
    // Important variables
    let list;
    getListLockStatus(req, list_id)
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // 1. List is unlocked
        if (
          lock_status === null ||
          (lock_status !== null && lock_user_id !== req.session.organization_user_id)
        ) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          return listUtils.getListNameSchema(req, list_id);
        }
      })
      .then((record) => {
        // 2. Deleting list locations
        list = record;
        location_ids.forEach((location_id) => {
          promiseResolver = promiseResolver.then(() => {
            return listUtils.deleteSingleLocation(req, list, location_id);
          });
        });
        return promiseResolver;
      })
      .then(() => {
        // 3. Update list count of deleted location
        const parameters = [
          { field: 'table_name', type: sql.NVarChar(150), value: list.list_table },
          { field: 'list_id', type: sql.Int, value: list.id },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspUpdateListCount', parameters);
      })
      .then(() => {
        // 4. Unlock list to allow further interaction
        return setListUnlocked(req, list_id);
      })
      .then(async () => {
        // 5. Set list status to DRAFT
        await resetListStatus(req, list_id, gfw_list_id, listStatus.Draft);
        logger.logActivity(
          req,
          logger.listActivityTypes.List.LocationDeletedFromList,
          `Locations with IDs (${location_ids}) deleted from (${list.list_name})`
        );
        resolve(true);
      })
      .catch((err) => {
        console.log('Error in deleting location', err);
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteList,
          `Failed to delete locations from list id ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {deleteFilteredLocations}
 *   @summary Deletes locations from a list using query parameters
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id
 *   @param {Array} filters
 *   @param  {Number} gfw_list_id
 *   @return {Promise}
 */
const deleteFilteredLocations = (req, list_id, filters, gfw_list_id) => {
  return new Promise((resolve, reject) => {
    // Important variables
    let list;
    getListLockStatus(req, list_id)
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // 1. List is unlocked
        if (
          lock_status === null ||
          (lock_status !== null && lock_user_id !== req.session.organization_user_id)
        ) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          return listUtils.getListNameSchema(req, list_id);
        }
      })
      .then((record) => {
        // 2. Deleting list locations
        list = record;
        return listUtils.deleteFilteredLocations(req, list_id, filters);
      })
      .then(() => {
        // 3. Update list count of deleted location
        const parameters = [
          { field: 'table_name', type: sql.NVarChar(150), value: list.list_table },
          { field: 'list_id', type: sql.Int, value: list.id },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspUpdateListCount', parameters);
      })
      .then(() => {
        // 4. Unlock list to allow further interaction
        return setListUnlocked(req, list_id);
      })
      .then(async () => {
        // 5. Set list status to DRAFT
        await resetListStatus(req, list_id, gfw_list_id, listStatus.Draft);
        logger.logActivity(
          req,
          logger.listActivityTypes.List.LocationDeletedFromList,
          `Locations with filters (${filters.toString()}) deleted from (${list.list_name})`
        );
        resolve(true);
      })
      .catch((err) => {
        console.log('Error in deleting location', err);
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteList,
          `Failed to delete locations from list id ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {editLocations}
 *   @summary Deletes locations from a list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id
 *   @param {Array} location_ids
 *   @param {Array} arrayAttributes - Array of objects containing key:value pairs of column: value
 *   @return {Promise}
 */
const editLocations = (req, list_id, location_ids, arrayAttributes) => {
  const EDIT_EXCLUDED_COLUMNS = [
    'list_id',
    'location name',
    'investment name',
    'latitude',
    'longitude',
    'analysis area',
    'analysis radius',
    'commodity',
    'location classification',
    'total_area',
    'list_location_id',
    'analysis_list_id',
    'template_id',
  ];

  let promiseResolver = Promise.resolve();
  return new Promise((resolve, reject) => {
    // Confirm length of features and src_location_ids match
    if (location_ids.length !== arrayAttributes.length) {
      reject(new Error('Length of arguements do not match.'));
    }

    getListLockStatus(req, list_id)
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // List is unlocked
        if (
          lock_status === null ||
          (lock_status !== null && lock_user_id !== req.session.organization_user_id)
        ) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          location_ids.forEach((location_id, idx) => {
            promiseResolver = promiseResolver.then(() => {
              const location = arrayAttributes[idx];
              const locationTransformedKeysToLowerCase = _.transform(
                location,
                (result, val, key) => {
                  // eslint-disable-next-line no-param-reassign
                  result[key.toLowerCase()] = val;
                }
              );
              const locationAttributesFiltered = _.omit(
                locationTransformedKeysToLowerCase,
                EDIT_EXCLUDED_COLUMNS
              );
              return listUtils.editSingleLocation(
                req,
                list_id,
                location_id,
                locationAttributesFiltered
              );
            });
          });
          return promiseResolver;
        }
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.LocationUpdatedInList,
          'Locations have been updated.'
        );
        resolve(true);
      })
      .catch((err) => {
        console.log('Error editing location', err);
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdateLists,
          `Failed to update locations from list id ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {copyLocations}
 *   @summary Copies location to list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number} src_list_id
 *   @param  {Array}  src_location_ids
 *   @param  {Number} dest_list_id
 *   @param  {Object} src_geojson
 *   @param  {Number} gfw_list_id
 *   @return {Promise}
 */
const copyLocations = (
  req,
  src_list_id,
  src_location_ids,
  dest_list_id,
  src_geojson,
  gfw_list_id
) => {
  let promiseResolver = Promise.resolve();
  // Return a promise for copying all locations
  return new Promise((resolve, reject) => {
    // Important variables
    let src_list;
    let dest_list;
    let dest_location_id;
    let dest_location_ids;

    // Confirm length of features and src_location_ids match
    if (src_location_ids.length !== src_geojson.features.length) {
      const errorObject = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.failedTocopyLocations,
        `Failed to copy locations from list id ${src_list_id} to list id ${dest_list_id}`,
        {}
      );
      reject(errorObject);
      return;
    }

    Promise.all([
      listUtils.getListNameSchema(req, src_list_id),
      listUtils.getListNameSchema(req, dest_list_id),
    ])
      .then((results) => {
        const [src, dest] = results;
        src_list = src;
        dest_list = dest;

        return getListLockStatus(req, src_list_id);
      })
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // List is unlocked
        if (
          lock_status === null ||
          (lock_status !== null && lock_user_id !== req.session.organization_user_id)
        ) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          // Lock the list from any other transactions
          return setListLocked(req, dest_list_id);
        }
      })
      .then(() => {
        // Perform uploadBulkLocations
        return listUtils.uploadBulkLocations(req, dest_list.id, dest_list.list_name, src_geojson);
      })
      .then((resultGeoJSON) => {
        // Array of destination location ids - assumption that it is in the same order as src_locations_ids
        dest_location_ids = resultGeoJSON.features.map((feature) => feature.properties.location_id);

        // Get analysis columns to be copied
        const parameters = [{ field: 'list_id', type: sql.Int, value: src_list.id }];
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspGetAnalysisColumns',
          parameters
        );
      })
      .then((recordsets) => {
        const columns = recordsets.map((record) => record.COLUMN_NAME);
        const statement = columns
          .map((column) => `[${column}] = [${src_list.analysis_table}].[${column}]`)
          .join(',');

        // Loop copy single location analysis
        src_location_ids.forEach((src_location_id, idx) => {
          promiseResolver = promiseResolver.then(() => {
            return listUtils.copySingleLocation(
              req,
              src_list,
              dest_list,
              src_location_id,
              dest_location_ids[idx],
              statement
            );
          });
        });
        return promiseResolver;
      })
      .then(() => {
        // 3. Update list count of appended location
        const parameters = [
          { field: 'table_name', type: sql.NVarChar(150), value: dest_list.list_table },
          { field: 'list_id', type: sql.Int, value: dest_list.id },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspUpdateListCount', parameters);
      })
      .then(() => {
        // Unlock the list
        return Promise.all([setListUnlocked(req, src_list_id), setListUnlocked(req, dest_list_id)]);
      })
      .then(() => {
        // Set list status to processing before requesting list level analysis
        return resetListStatus(req, dest_list_id, gfw_list_id, req.body.list_status_id);
      })
      .then(async () => {
        // 4. Run analysis for entire list
        await AnalysisManager.requestAnalysis(req, dest_list.list_name, {}, true);

        logger.logActivity(
          req,
          logger.listActivityTypes.List.LocationCopiedToList,
          `Locations copied (${src_list.list_name}) -> (${dest_list.list_name})`
        );

        resolve(true);
      })
      .catch((err) => {
        console.log('Error copying location', err);
        Promise.all([setListUnlocked(req, dest_list_id), setListUnlocked(req, src_list_id)]).then(
          () => {
            const errorObject = errorUtils.createErrorMessage(
              req,
              errorUtils.errorCodes.failedTocopyLocations,
              `Failed to copy locations from list id ${src_list_id} to list id ${dest_list_id}`,
              err
            );
            reject(errorObject);
          }
        );
      });
  });
};

/** @function {moveLocations}
 *   @summary Performs copy to destination list and delete on source list
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number} src_list_id - Source List ID
 *   @param  {Array}  src_location_ids - Source List location IDs
 *   @param  {Number} dest_list_id - Destination List ID
 *   @param  {Object} geojson - Locations GeoJSON
 *   @param  {Number} gfw_list_id - GFW Pro List ID (e.g. 1..5) or 0 if not GFW Pro list
 *   @param  {Boolean} delete_src_list - Delete list signal (TRUE/FALSE)
 *   @return {Promise} - Returns resolve TRUE or reject error message
 */
const moveLocations = (
  req,
  src_list_id,
  src_location_ids,
  dest_list_id,
  geojson,
  gfw_list_id,
  delete_src_list
) => {
  return new Promise((resolve, reject) => {
    // Important Variables
    let src_list;
    let dest_list;

    Promise.all([
      listUtils.getListNameSchema(req, src_list_id),
      listUtils.getListNameSchema(req, dest_list_id),
    ])
      .then((record) => {
        const [src, dest] = record;
        src_list = src;
        dest_list = dest;
        // 1. Run copy location
        return copyLocations(
          req,
          src_list_id,
          src_location_ids,
          dest_list_id,
          geojson,
          gfw_list_id
        );
      })
      .then(() => {
        return setListLocked(req, src_list_id);
      })
      .then(() => {
        if (delete_src_list) {
          return deleteList(req, src_list_id);
        }
        return deleteLocations(req, src_list_id, src_location_ids, gfw_list_id);
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.LocationMovedFromList,
          `Locations moved from (${src_list.list_name})`
        );

        if (delete_src_list) {
          logger.logActivity(
            req,
            logger.listActivityTypes.List.ListDeleted,
            `(${src_list.list_name}) was deleted due to all locations having been moved to (${dest_list.list_name})`
          );
        }

        resolve(true);
      })
      .catch((err) => {
        console.log('Error moving location', err);
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToMoveLocations,
          `Failed to move locations from list id ${src_list_id} to list id ${dest_list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {getListLockStatus}
 *   @summary Gets current lock status of specified list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id - id of list to be locked
 *   @return {Promise}
 */
const getListLockStatus = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListLockStatus', parameters)
      .then((recordsets) => {
        const [record] = recordsets;
        resolve(record);
      })
      .catch((err) => {
        console.log('Issue getting list lock status', err);
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetLockStatus,
          `Failed to get lock state for list id ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * Get List by List Name
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {string} list_name - List Name
 * @return {Promise<*>} - Filtered list from array of all lists
 */
const getListByListName = async (req, list_name) => {
  try {
    const allLists = await getAllLists(req);
    return allLists.find((list) => list.list_name === list_name);
  } catch (e) {
    console.log('getListByListName', e);
  }
};

/** @function {checkListLockStatus}
 *   @summary Checks the status of the locked list status and performs actions accordingly
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id - id of list to be locked
 *   @param {Object} record - Result of ListManager.getListLockStatus
 *   @return {Promise}
 */
const checkListLockStatus = (req, list_id, record) => {
  return new Promise((resolve, reject) => {
    const { lock_status, lock_user_id } = record;
    // List is unlocked
    if (lock_status === null) {
      setListLocked(req, list_id)
        .then(() => {
          resolve({
            isLocked: false,
            lock_user_id,
          });
        })
        .catch((err) => {
          const errorMessage = errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToGetLockStatus,
            `Failed to set lock list ${list_id}`,
            err
          );
          reject({ error: true, errorMessage });
        });
      // List is locked
    } else {
      // Check if the list has be locked for more than 15 minutes (in ms)
      const fifteenMinutes = 900000;
      const now = new Date();
      const pastFifteen = now - lock_status > fifteenMinutes;
      if (pastFifteen) {
        setListUnlocked(req, list_id)
          .then(() => {
            return setListLocked(req, list_id);
          })
          .then(() => {
            resolve({
              isLocked: false,
              lock_user_id,
            });
          })
          .catch((err) => {
            const eo = errorUtils.createErrorMessage(
              req,
              errorUtils.errorCodes.failedToGetLockStatus,
              `Failed to set lock list ${list_id}`,
              err
            );
            reject({ error: true });
          });
      } else {
        resolve({
          isLocked: true,
          lock_user_id,
        });
      }
    }
  });
};

/** @function {setListLocked}
 *   @summary Performs copy to destination list and delete on source list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id - id of list to be locked
 *   @return {Promise}
 */
const setListLocked = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspSetListLocked', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetLockStatus,
          `Failed to lock list id ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {setListUnlocked}
 *   @summary Performs copy to destination list and delete on source list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id - id of list to be unlocked
 *   @return {Promise}
 */
const setListUnlocked = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'user_id', type: sql.NVarChar(150), value: undefined },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspSetListUnlocked', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetLockStatus,
          `Failed to unlock list id ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {resetListStatus}
 *   @summary Sets list status to pending.
 *   @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {number} list_id - ID of list to be unlocked
 *   @param {number} gfw_list_id - The ID of the GFW List that this new list is associated with
 *   @param {number} [list_status_id = listStatus.Draft] list_status_id - List status ID (eg. 2, 4)
 *   @return {Promise} A promise object that returns true, otherwise error object
 */
const resetListStatus = (req, list_id, gfw_list_id, list_status_id = listStatus.Draft) => {
  return new Promise(async (resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'status_id', type: sql.Int, value: list_status_id },
      { field: 'associated_gfwlist', type: sql.TinyInt, value: gfw_list_id },
    ];

    const listStatusCommonName = getListStatusCommonName(list_status_id);
    const { list_name } = await listUtils.getListNameSchema(req, list_id);

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspResetListStatus', parameters)
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUpdate,
          `${list_name} is now ${listStatusCommonName}`
        );
        resolve(true);
      })
      .catch((error) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetLockStatus,
          `Error sending ${list_name} to analysis: ${error}`
        );
        reject(errorObject);
      });
  });
};

/** @function {deleteList}
 *   @summary Deletes a list from Lists table, and list's attribute and analysis table
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id - id of list
 *   @return {Promise}
 */
const deleteList = (req, list_id) => {
  let list;
  return new Promise((resolve, reject) => {
    getListLockStatus(req, list_id)
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // List is unlocked
        if (
          lock_status === null ||
          (lock_status !== null && lock_user_id !== req.session.organization_user_id)
        ) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          return listUtils.getListNameSchema(req, list_id);
        }
      })
      .then((result) => {
        // 1. Get the table schema
        list = result;
        // 2. Remove from Organization's List table
        const parameters = [{ field: 'list_id', type: sql.Int, value: list.id }];

        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspDeleteList', parameters);
      })
      .then(() => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListDeleted,
          `User '${req.session.user_email}' has deleted list (${list.list_name}).`
        );
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteList,
          `Failed to delete list id ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

const setListStatus = (req, list_id, newStatus) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    switch (newStatus) {
      case listStatus.Pending:
        parameters.push({
          field: 'status_id',
          type: sql.Int,
          value: listStatus.Pending,
        });
        break;
      case listStatus.Active:
        parameters.push({
          field: 'status_id',
          type: sql.Int,
          value: listStatus.Active,
        });
        break;
      case listStatus.Inactive:
        parameters.push({
          field: 'status_id',
          type: sql.Int,
          value: listStatus.Inactive,
        });
        break;
      case listStatus.Draft:
        parameters.push({
          field: 'status_id',
          type: sql.Int,
          value: listStatus.Draft,
        });
        break;
      default:
        reject('incorrect status id');
    }
    sqlUtils.executeOrganizationStoredProcedure(req, 'uspSetListStatus', parameters);
    resolve(true);
  });
};

/**
 * Get list status Common Name
 *
 * @param {number} statusId - Status ID
 * @return {string} - List status Common Name
 */
const getListStatusCommonName = (statusId) => {
  let listStatusCommonName;

  for (const item in listStatus) {
    if (listStatus[item] === statusId) {
      listStatusCommonName = item;
    }
  }

  return listStatusCommonName;
};

/**
 * Get Location IDs from result GeoJSON from uploadToExistingList function
 *
 * @param {Object} GeoJSON - GeoJSON
 * @return {number[]} - List of IDs
 */
function getLocationIdsFromGeoJSON(GeoJSON) {
  return GeoJSON.features.map((item) => item.properties.location_id);
}

/**
 * @description - Get List Location Geometry
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 */
function getListLocationGeometry(req) {
  const { listTableName, locationID } = req.body;

  const parameters = [
    { field: 'list_table', type: sql.NVarChar(150), value: listTableName },
    { field: 'location_id', type: sql.Int, value: locationID },
  ];

  return new Promise((resolve, reject) => {
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetLocation', parameters)
      .then((results) => {
        resolve(results);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * @function {deleteListIfEmpty}
 * @summary - Delete if the list is empty. Checks first if the list is empty, runs deleteList
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} listID - List Id to be deleted if empty
 */
function deleteListIfEmpty(req, listID) {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspCheckIfListIsEmpty', parameters)
      .then((records) => {
        const [resultset] = records;
        const { isListEmpty } = resultset;

        if (!isListEmpty) {
          resolve(isListEmpty);
        } else {
          sqlUtils
            .executeOrganizationStoredProcedure(req, 'uspDeleteList', parameters)
            .then(() => {
              logger.logActivity(
                req,
                logger.listActivityTypes.List.ListDeleted,
                `Deleted empty list with id (${listID}).`
              );
              resolve(isListEmpty);
            })
            .catch((error) => {
              const errorObject = errorUtils.createErrorMessage(
                req,
                errorUtils.errorCodes.failedToDeleteList,
                `Failed to delete list with id (${listID}). List not empty`,
                error
              );
              reject(errorObject);
            });
        }
      })
      .catch((error) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteListIsNotEmpty,
          `Failed to delete list is not empty ${listID}`,
          error
        );
        reject(errorObject);
      });
  });
}

module.exports = {
  getUserLists,
  getUserListsWithAnalysisId,
  rerunExistingList,
  getAllLists,
  getListLocations,
  getSimplifiedListLocations,
  getDashboardListLocations,
  getListLocationsNoGeom,
  getLocationsCount,
  uploadToExistingList,
  uploadToNewList,
  uploadToNewListAndSaveAsDraft,
  updateIndividualLocationsStatusID,
  deleteLocations,
  deleteFilteredLocations,
  editLocations,
  copyLocations,
  moveLocations,
  getListLockStatus,
  getListByListName,
  setListLocked,
  setListUnlocked,
  checkListLockStatus,
  deleteList,
  resetListStatus,
  setListStatus,
  getListStatusCommonName,
  getLocationIdsFromGeoJSON,
  getPaginatedAnalysisDataForUserList,
  getNumberPagesForAnalysisDataUserList,
  getListLocationGeometry,
  deleteListIfEmpty,
  getAllListsWithAnalysisId,
  getWorstStatusId,
};

// Require after modules have been exported so the module can be fully loaded
const AnalysisManager = require(path.resolve('./config/publicutils/analysisManager.utils'));
