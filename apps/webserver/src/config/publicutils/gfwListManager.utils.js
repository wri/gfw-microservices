/* eslint-disable no-promise-executor-return */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable default-case */
/* eslint-disable camelcase */
/* eslint-disable-next-line radix */
/** ******************************************************************
 *   @name : GFWlistManager.utils.js
 *   @description : A utility file to allow GFW Pro to obtain/set
 *                 list data.
 *
 *   @function {getGFWLists}
 *   @function {getGFWListLocations}
 *   @function {getGFWListLocationsNoGeom}
 *   @function {updateGFWLists}
 *   @function {copyLocations}
 *   @function {getAdministrativeAreasInfo}
 *   @function {getAdministrativeAreasData}
 * @function {getAdministrativeAreasDataByLocationId}
 *   @function {getProtectedAreasInfo}
 *   @function {getProtectedAreasData}
 *   @function {initialize}
 *
 ******************************************************************* */
// Imports required for this module.
const path = require('path');
const sql = require('mssql');
const config = require('../config');

const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const lambdaUtils = require(path.resolve('./config/privateutils/lambda.utils'));
const locationUtils = require(path.resolve('./config/privateutils/location.utils'));
const { getAdministrativeAreasDataByLocation } = require(path.resolve(
  './queries/system/getAdministrativeAreasDataByLocation'
));
import { gfwListsIds, gfwListsNames } from '@wri-monorepos/constants';

let adminInfo = [];
let protectedInfo = [];

/** @function {getGFWLists}
 *   @summary Function to returns gfw list in database
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getGFWLists = (req) => {
  return new Promise((resolve, reject) => {
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetGfwLists')
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get gfw lists',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 * @function {getGFWListsByListId}
 * @summary Function to find GFWList by Id using getGFWLists
 * @param {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {Int} listId - GFWList Id to find
 * @return {Promise} Returns promise object. If successful, list object, otherwise, error object
 */
const getGFWListsByListId = async (req, listId) => {
  try {
    const gfwListCollection = await getGFWLists(req);
    return gfwListCollection.find((gfwListData) => gfwListData.id === Number(listId));
  } catch (error) {
    console.log('getGFWListsByListId', error);
  }
};

/** @function {getGFWListLocations}
 *   @summary Get function to return geojson of locations for a partiuclar list.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
const getGFWListLocations = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listID', type: sql.Int, value: list_id }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetGFWListLocations', parameters)
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

/** @function {getGFWListLocationsNoGeom}
 *   @summary Get function to return json of location metadata without geometry.
 *   @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id - Unique list id of the list.
 *   @param {[]} location_ids - Array of location ids.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getGFWListLocationsNoGeom = (req, list_id, location_ids = []) => {
  return new Promise((resolve, reject) => {
    const parameters =
      Array.isArray(location_ids) && location_ids.length
        ? [{ field: 'location_ids', type: sql.VarChar(200), value: location_ids.toString() }]
        : [];

    let promise;
    switch (Number(list_id)) {
      case 1:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetAdministrativeAreaAttributes',
          parameters
        );
        break;
      case 2:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetOilPalmConcessionsAttributes',
          parameters
        );
        break;
      case 3:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetPalmOilMillAttributes',
          parameters
        );
        break;
      case 4:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetProtectedAreaAttributes',
          parameters
        );
        break;
      case 5:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetRSPOOilPalmConcessionsAttributes',
          parameters
        );
        break;
    }
    promise
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get list location (no Geom) for List ${list_id}`,
          err
        );
        reject(errorObject);
      });
  });
};

const getGFWListLocationsGeom = (req, list_id, location_ids = []) => {
  return new Promise((resolve, reject) => {
    const parameters = location_ids.length
      ? [{ field: 'location_ids', type: sql.VarChar(sql.MAX), value: location_ids.toString() }]
      : '';
    let promise;
    switch (parseInt(list_id, 10)) {
      case 1:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetAdministrativeAreasGeom',
          parameters
        );
        break;
      case 2:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetOilPalmConcessionsGeom',
          parameters
        );
        break;
      case 3:
        promise = sqlUtils.executeSystemStoredProcedure(req, 'uspGetPalmOilMillsGeom', parameters);
        break;
      case 4:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetProtectedAreasGeom',
          parameters
        );
        break;
      case 5:
        promise = sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetRSPOOilPalmConcessionsGeom',
          parameters
        );
        break;
    }

    promise
      .then((recordsets) => {
        const geojson = locationUtils.createGeoJSON(req, recordsets);
        resolve(geojson);
      })
      .catch((e) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get list location (Geom) for List ${parseInt(list_id, 10)}`,
          e
        );
        reject(errorObject);
      });
  });
};

/** @function {getAdministrativeAreasInfo}
 *   @summary Get function to return country, state, and substate.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise<any>} Returns admin info
 */
const getAdministrativeAreasInfo = (req) => {
  return new Promise((resolve) => resolve(adminInfo));
};

/** @function {getProtectedAreasInfo}
 *   @summary Get function to return country, state, and substate.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise<any>} Returns admin info
 */
const getProtectedAreasInfo = (req) => {
  return new Promise((resolve) => resolve(protectedInfo));
};

/** @function {getAdministrativeAreasData}
 *   @summary Get function to return country, state, and substate.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Object} filters - Filter info to filter the admin area data by.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getAdministrativeAreasData = (req, filters) => {
  // TODO: HANDLE FILTERING DATA PROPERLY
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'country', type: sql.NVarChar(150), value: filters.selectedCountry },
      { field: 'states', type: sql.NVarChar(sql.MAX), value: filters.selectedStates.toString() },
      {
        field: 'sub_states',
        type: sql.NVarChar(sql.MAX),
        value: filters.selectedSubStates.toString(),
      },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetAdministrativeAreasData', parameters)
      .then((recordset) => {
        resolve(recordset);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get Administrative Areas data',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getAdministrativeAreasDataByLocationId}
 *   @summary Get function to return country, state, and substate.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Object} locationId - locationId
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getAdministrativeAreasDataByLocationId = (req, locationId) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'location_id', type: sql.Int, value: locationId }];

    sqlUtils
      .executeSystemQuery(getAdministrativeAreasDataByLocation, parameters)
      .then((recordset) => {
        const [results] = recordset;
        resolve(results);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get Administrative Areas data',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getProtectedAreasData}
 *   @summary Get function to return country, state, and substate.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Object} filters - Filter info to filter the admin area data by.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getProtectedAreasData = (req, filters) => {
  // TODO: HANDLE FILTERING DATA PROPERLY
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'country', type: sql.NVarChar(150), value: filters.selectedCountry },
      { field: 'state', type: sql.NVarChar(150), value: filters.selectedState },
      { field: 'sub_state', type: sql.NVarChar(150), value: filters.selectedSubState },
      {
        field: 'selected_designation',
        type: sql.NVarChar(150),
        value: filters.selectedDesignation,
      },
      {
        field: 'selected_designation_type',
        type: sql.NVarChar(150),
        value: filters.selectedDesignationType,
      },
      { field: 'selected_iucn', type: sql.NVarChar(150), value: filters.selectedIUCN },
      {
        field: 'selected_names',
        type: sql.NVarChar(sql.MAX),
        value: filters.selectedNames.toString(),
      },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetProtectedAreasData', parameters)
      .then((recordset) => {
        resolve(recordset);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get Protected Areas data',
          errorMessage
        );
        reject(errorObject);
      });
  });
};
/**
 * @function getGFWListNames
 * @param {Array} list_ids lists IDs
 * @returns {Array<string>} list_ids names mapped
 */
const getGFWListNames = (list_ids) => {
  return list_ids.map((id) => gfwListsNames[id]);
};

/** @function {updateGFWLists}
 *   @summary Copies locations from one list to another
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Array} list_ids - Array of list ids
 *   @return
 */
const updateGFWLists = (req, list_ids) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    const organization_database = config.SQLConnection.database;
    list_ids.forEach((list_id) => {
      const payload = {
        list_id,
        organization_database,
        env: process.env.NODE_ENV,
      };
      promises.push(lambdaUtils.invoke('controller-gfwLists', payload));
    });
    Promise.all(promises)
      .then((result) => {
        // TODO - see below. need to determine who/how receiving account requests on WRI Admin side
        getGFWListNames(list_ids);
        // list_names.forEach(list => snsUtils.publish(config.platformVars.snsType.UPDATE_GFWLIST, list));
        // const content = { list_names };
        // const emailTemplate = AWSSES.createBodyContent(req, config.platformVars.emailType.UPDATE_GFWLISTS, content);
        // AWSSES.sendEmail(req, config.AWSVars.ses.sender, [''], 'Updating Global Forest Watch Lists', emailTemplate);
        resolve(result);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToUpdateLists,
          'Failed to update GFW Lists.',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

const getGFWListLocationsGlobalId = (req, list_id, global_ids = []) => {
  return new Promise((resolve, reject) => {
    const parameters = global_ids.length
      ? [
          {
            field: 'global_ids',
            type: sql.VarChar(200),
            value:
              list_id === '1'
                ? global_ids.toString()
                : global_ids.map((id) => `'${id}'`).toString(),
          },
        ]
      : '';

    let promise;
    switch (parseInt(list_id, 10)) {
      case 1:
        promise = sqlUtils.executeSystemStoredProcedureAllRecords(
          req,
          'uspGetAdministrativeAreasGlobalId',
          parameters
        );
        break;
      case 2:
        promise = sqlUtils.executeSystemStoredProcedureAllRecords(
          req,
          'uspGetOilPalmConcessionsGlobalId',
          parameters
        );
        break;
      case 3:
        promise = sqlUtils.executeSystemStoredProcedureAllRecords(
          req,
          'uspGetPalmOilMillsFromMillId',
          parameters
        );
        break;
      case 4:
        promise = sqlUtils.executeSystemStoredProcedureAllRecords(
          req,
          'uspGetProtectedAreasGlobalId',
          parameters
        );
        break;
      case 5:
        promise = sqlUtils.executeSystemStoredProcedureAllRecords(
          req,
          'uspRSPOOilPalmConcessionsGlobalId',
          parameters
        );
        break;
    }
    promise
      .then((recordsets) => {
        const [listData, analysisData] = recordsets;
        resolve({ listData, analysisData });
      })
      .catch((e) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          `Failed to get list location (No Geom) for List ${parseInt(list_id, 10)}`,
          e
        );
        reject(errorObject);
      });
  });
};

/**
 * Get GFW List Schema
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} gfw_list_id - GFW list ID
 * @return {Promise<*>} - - GFW source list schema
 */
async function getGFWListSchema(req, gfw_list_id) {
  const gwfLists = await getGFWLists(req);
  const src_list = gwfLists.find((list) => list.id === gfw_list_id);
  src_list.list_analysis_table_name = `gfwpro.dbo.[${src_list.list_analysis_table_name}]`;
  return src_list;
}

/**
 * Get GFW Analysis Table Columns
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} gfw_list_id - GFW list ID
 * @return {Promise<*>} - GFW Analysis table Columns
 */
async function getGFWAnalysisTableColumns(req, gfw_list_id) {
  const params_src = [{ field: 'list_id', type: sql.Int, value: gfw_list_id }];
  const gfw_analysis_table_columns = await sqlUtils.executeSystemStoredProcedure(
    req,
    'uspGetGFWAnalysisColumns',
    params_src
  );
  return gfw_analysis_table_columns;
}

/**
 * Get GFW Analysis Table Columns - SQL Statement
 *
 * @param {Object} src_list - GFW list schema
 * @param {Object[]} gfw_analysis_table_columns - GFW Analysis table Columns
 * @param {Number} dest_location_id - location_id of destination location
 * @return {string} - SQL Statement
 */
function getGFWAnalysisTableColumnsStatement(
  src_list,
  gfw_analysis_table_columns,
  dest_location_id
) {
  return gfw_analysis_table_columns
    .map((record) => record.COLUMN_NAME)
    .map((column) => {
      if (column === 'location_id') {
        return `[${column}] = ${dest_location_id}`;
      }
      return `[${column}] = ${src_list.list_analysis_table_name}.[${column}]`;
    })
    .join(',');
}

/**
 * Copy Location from GFW list to another list
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} src_list - Result of listUtils.createNameSchema
 * @param {Object} dest_list - Result of listUtils.createNameSchema
 * @param {Number} src_location_id - location_id of targetted location
 * @param {Number} dest_location_id - location_id of destination location
 * @param {Object[]} gfw_analysis_table_columns - GFW Analysis table Columns
 * @return {Promise} Returns true if successful, else error object
 */
const copyGFWSingleLocation = (
  req,
  src_list,
  dest_list,
  src_location_id,
  dest_location_id,
  gfw_analysis_table_columns
) => {
  const statement = getGFWAnalysisTableColumnsStatement(
    src_list,
    gfw_analysis_table_columns,
    dest_location_id
  );

  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'src_list_id', type: sql.Int, value: src_list.id },
      { field: 'dest_list_id', type: sql.Int, value: dest_list.id },
      { field: 'src_location_id', type: sql.Int, value: src_location_id },
      { field: 'dest_location_id', type: sql.Int, value: dest_location_id },
      { field: 'statement', type: sql.NVarChar(sql.MAX), value: statement },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspCopyGFWLocationAnalysis', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Copy GFW Locations to another list
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} src_list - GFW source list schema
 * @param {Object} dest_list - Destination list schema
 * @param {number[]} src_location_ids - GFW source list IDs
 * @param {number[]} dest_location_ids - Destination list IDs
 * @return {Promise<void>}
 */
const copyGFWLocationsToList = async (
  req,
  src_list,
  dest_list,
  src_location_ids,
  dest_location_ids
) => {
  const gfw_analysis_table_columns = await getGFWAnalysisTableColumns(req, src_list.id);

  for (const [idx, src_location_id] of src_location_ids.entries()) {
    await copyGFWSingleLocation(
      req,
      src_list,
      dest_list,
      src_location_id,
      dest_location_ids[idx],
      gfw_analysis_table_columns
    );
  }
};

/**
 * @function isGfwList
 * @param {Int/Number} listId
 * @return {Boolean}
 */
const isGfwList = (listId) => {
  return Object.values(gfwListsIds).includes(listId);
};

/**
 * @function initialize
 * @summary Initializes the GFW List Manager.
 *           Loads all the lists needed for the application.
 */
function initialize() {
  // Create a new Promise object to return.
  return new Promise((resolve, reject) => {
    Promise.all([
      sqlUtils.executeSystemStoredProcedure(null, 'uspGetAdministrativeAreasInfo'),
      sqlUtils.executeSystemStoredProcedure(null, 'uspGetProtectedAreasInfo'),
    ])
      .then((recordsets) => {
        [adminInfo, protectedInfo] = recordsets;
        resolve(true);
      })
      .catch((errMsg) => {
        reject(errMsg);
      });
  });
}

module.exports = {
  getGFWLists,
  getGFWListsByListId,
  getGFWListLocations,
  getGFWListLocationsNoGeom,
  getGFWListLocationsGeom,
  getGFWListLocationsGlobalId,
  getGFWListNames,
  updateGFWLists,
  getAdministrativeAreasInfo,
  getAdministrativeAreasData,
  getAdministrativeAreasDataByLocationId,
  getProtectedAreasInfo,
  getProtectedAreasData,
  getGFWListSchema,
  getGFWAnalysisTableColumns,
  getGFWAnalysisTableColumnsStatement,
  copyGFWSingleLocation,
  copyGFWLocationsToList,
  isGfwList,
  initialize,
};
