/** ******************************************************************
 *   @name : list.utils.js
 *   @description : A utility file for lists
 *
 *   @function{copySingleLocation}
 *   @function{createListNameSchema}
 *   @function{deleteSingleLocation}
 *   @function{editSingleLocation}
 *   @function{getListNameSchema}
 *   @function{uploadBulkLocations}
 *
 ********************************************************************/
const path = require('path');
const sql = require('mssql');
const config = require('../config');
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const locationUtils = require(path.resolve('./config/privateutils/location.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));

/** @function {copySingleLocation}
 *   @summary Copy Location from one list to another
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Object} src_list - Result of listUtils.createNameSchema
 *   @param  {Object} dest_list - Result of listUtils.createNameSchema
 *   @param  {Number} src_location_id - location_id of targetted location
 *   @param {Number} dest_location_id - location_id of destination location
 *   @param {String} statement - SQL Statement
 *   @return {Promise} Returns true if successful, else error object
 */
const copySingleLocation = (req, src_list, dest_list, src_location_id, dest_location_id, statement) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'dest_list_id', type: sql.Int, value: dest_list.id },
      { field: 'dest_location_id', type: sql.Int, value: dest_location_id },
      { field: 'src_list_id', type: sql.Int, value: src_list.id },
      { field: 'src_location_id', type: sql.Int, value: src_location_id },
      { field: 'statement', type: sql.NVarChar(sql.MAX), value: statement },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspCopyLocationAnalysis', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** @function {createListNameSchema}
 *   @summary Copy Location from one list to another
 *   @param  {string} list_name - Using list's name to create it's schema
 *   @return {Object} Returns object
 */
const createListNameSchema = (list_name) => ({
  list_name: list_name,
  list_table: `list-${list_name.replace(/\s/g, '').toLowerCase()}`,
  analysis_table: `analysis-${list_name.replace(/\s/g, '').toLowerCase()}`,
});

/** @function {deleteSingleLocation}
 *   @summary Delete a location from list and analysis tables
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Object} list - Result of listUtils.createNameSchema
 *   @param  {Number} location_id - location_id of targetted location
 *   @return {Promise} Returns true if successful, else error object
 */
const deleteSingleLocation = (req, list, location_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list.id },
      { field: 'location_id', type: sql.Int, value: location_id },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspDeleteLocation', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** @function {deleteFilteredLocations}
 *   @summary Delete locations from list and analysis tables filtered by query string
 *   @summary Get function to return json of paginated location metadata with geometry.
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Integer} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const deleteFilteredLocations = (req, list_id, filters) => {
  const { country, state, subState, selectedAreaMin, selectedAreaMax, searchString } = filters;
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'listID', type: sql.Int, value: list_id },
      { field: 'Country', type: sql.NVarChar, value: country ? country : null },
      { field: 'State', type: sql.NVarChar, value: state ? state : null },
      { field: 'SubState', type: sql.NVarChar, value: subState ? subState : null },
      { field: 'AnalysisAreaMin', type: sql.Int, value: selectedAreaMin ? selectedAreaMin : null },
      { field: 'AnalysisAreaMax', type: sql.Int, value: selectedAreaMax ? selectedAreaMax : null },
      { field: 'SearchString', type: sql.NVarChar, value: searchString || null },
    ];
    console.log(parameters);
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspDeleteLocationIdsFilteredDataForUserList', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** @function {editSingleLocation}
 *   @summary Edit a location from list
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number} list_id - id of list
 *   @param  {Number} location_id - location_id of targetted location
 *   @param {Object} attributes - Object with key value pairs of { column: value }
 *   @return {Promise} Returns true if successful, else error object
 */
const editSingleLocation = (req, list_id, location_id, attributes) => {
  return new Promise((resolve, reject) => {
    // Create dynamic SQL update SET string to update the columns
    const statement = Object.entries(attributes)
      .map((attribute) => {
        const [column, value] = attribute;
        return `[${column}]=${typeof value === 'string' || typeof value === 'boolean' ? `'${value.replace(/'/g, "''")}'` : value
          }`;
      })
      .join(',');

    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'location_id', type: sql.Int, value: location_id },
      { field: 'statement', type: sql.NVarChar, value: statement },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspEditLocation', parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** @function {getListNameSchema}
 *   @summary Gets list name schema from db
 *   @param  {number} list_id - id of desired list
 *   @return {Promise} Returns object if successful, error otherwise
 */
const getListNameSchema = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListNameSchema', parameters)
      .then((recordsets) => {
        const [record] = recordsets;
        resolve({
          id: record.id,
          list_name: record.list_name,
          list_table: record.list_table_name,
          analysis_table: record.list_analysis_table_name,
        });
      })
      .catch((err) => {
        console.log('Error getting list name schema', err);
        reject(false);
      });
  });
};

/** @function {uploadBulkLocations}
 *   @summary Adds location and attributes to existing list
 *   @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id
 *   @param {String} list_name
 *   @param {Object} geojson - a geojson object with array of features that contain geometry and properties
 *   @param commodity
 *   @return {Promise}
 */
const uploadBulkLocations = (req, list_id, list_name, geojson, commodity) => {
  return new Promise((resolve, reject) => {
    // Important variables
    let primary_key = 1;
    let max_id = 0;
    // Transform list name
    const list = createListNameSchema(list_name);
    // 1. Get the max ID to properly set primary key
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetMaxId', parameters)
      .then((recordsets) => {
        // Current max id from table - null if empty otherwise a number, then set the appropriate primary key
        max_id = recordsets[0].max_id === null ? 0 : recordsets[0].max_id;
        primary_key = recordsets[0].max_id === null ? 1 : recordsets[0].max_id + 1;
        // 2. Get Columns from list/table
        const sqlParameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetTableColumns', sqlParameters);
      })
      .then((recordsets) => {
        const columnNamesArray = [];
        const columnTypesArray = [];
        const dataArray = [];

        // Push column name types into respective arrays
        recordsets.forEach((column) => {
          if (column.COLUMN_NAME === 'location_id' || column.COLUMN_NAME.includes('flag_')) {
            columnNamesArray.push(column.COLUMN_NAME);
            columnTypesArray.push(sql.Int);
          } else {
            columnNamesArray.push(column.COLUMN_NAME);
            columnTypesArray.push(sqlUtils.getDataType(req, column.DATA_TYPE));
          }
        });

        // Push Inner array to dataArray for each feature
        geojson.features.forEach((feature) => {
          const featureArray = [];
          columnNamesArray.forEach((columnName) => {
            if (feature.properties.hasOwnProperty(columnName)) {
              featureArray.push(
                commodity && columnName === 'Commodity' // If we have a commodity argument, use it
                  ? commodity
                  : feature.properties[columnName]
              );
            }
          });
          // Add the feature geometry, feature primary key Add flag property for general, gran cho, glad, forma, viirs, terrai
          featureArray.push(locationUtils.getWKTGeometry(req, feature.geometry), primary_key, 0, 0, 0, 0, 0, 0);
          // Increment key for next feature
          primary_key += 1;
          dataArray.push(featureArray);
        });
        return sqlUtils.executeOrganizationBulkUpload(
          req,
          list.list_table,
          true,
          columnNamesArray,
          columnTypesArray,
          dataArray
        );
      })
      .then(() => {
        // Update number of locations in Lists table
        const sqlParameters = [
          { field: 'table_name', type: sql.NVarChar(150), value: list.list_table },
          { field: 'list_id', type: sql.Int, value: list_id },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspUpdateListCount', sqlParameters);
      })
      .then(() => {
        // Copy over list-<TABLE_NAME> ids to analysis-<TABLE_NAME>
        const sqlParameters = [
          { field: 'list_id', type: sql.Int, value: list_id },
          { field: 'start_location_id', type: sql.Int, value: max_id },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(req, 'uspAddNewLocationToAnalysisTable', sqlParameters);
      })
      .then((recordsets) => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUpdate,
          `User '${req.session.user_email}' has added new locations to list (${list.list_name}) Analysis Table.`
        );

        // Create geojson from recordsets
        const resultGeoJSON = locationUtils.createGeoJSON(req, recordsets);
        resolve(resultGeoJSON);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToAppendList,
          `Failed to append to ${list.table_name}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

module.exports = {
  copySingleLocation,
  createListNameSchema,
  deleteSingleLocation,
  deleteFilteredLocations,
  editSingleLocation,
  getListNameSchema,
  uploadBulkLocations,
};
