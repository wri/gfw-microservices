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
const copySingleLocation = (
  req,
  src_list,
  dest_list,
  src_location_id,
  dest_location_id,
  statement
) => {
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
 *   @param  {Number} list_id - Unique list id of the list.
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const deleteFilteredLocations = (req, list_id, filters) => {
  const { country, state, subState, selectedAreaMin, selectedAreaMax, searchString } = filters;
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'listID', type: sql.Int, value: list_id },
      { field: 'Country', type: sql.NVarChar(255), value: country ? country : null },
      { field: 'State', type: sql.NVarChar(255), value: state ? state : null },
      { field: 'SubState', type: sql.NVarChar(255), value: subState ? subState : null },
      { field: 'AnalysisAreaMin', type: sql.Int, value: selectedAreaMin ? selectedAreaMin : null },
      { field: 'AnalysisAreaMax', type: sql.Int, value: selectedAreaMax ? selectedAreaMax : null },
      { field: 'SearchString', type: sql.NVarChar(255), value: searchString || null },
    ];

    sqlUtils
      .executeOrganizationStoredProcedure(
        req,
        'uspDeleteLocationIdsFilteredDataForUserList',
        parameters
      )
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
        return `[${column}]=${
          typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value
        }`;
      })
      .join(',');

    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'location_id', type: sql.Int, value: location_id },
      { field: 'statement', type: sql.NVarChar(sql.MAX), value: statement },
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
const uploadBulkLocations = (req, list_id, list_name, geojson, commodity, attributes) => {
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
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspGetTableColumns',
          sqlParameters
        );
      })
      .then((columns) => {
        const bulkUploadPayload = [];
        /**
         * TODO GPV-3786
         * duplicated code
         */
        geojson.features.forEach((feature) => {
          let row = [];
          columns.forEach((column) => {
            let col = {
              field: column.COLUMN_NAME,
              type: sqlUtils.getDataType(req, column),
              value: undefined,
            };
            if (feature.properties.hasOwnProperty(column.COLUMN_NAME)) {
              col.value = feature.properties[column.COLUMN_NAME];

              if (column.COLUMN_NAME === 'Geometry') {
                col.value = locationUtils.getWKTGeometry(req, feature.geometry);
              }
            } else {
              /**
               *  Extra column to keep track
                  { COLUMN_NAME: 'Geometry', DATA_TYPE: 'geometry' }
                  { COLUMN_NAME: 'location_id', DATA_TYPE: 'int' }
                  { COLUMN_NAME: 'attributes', DATA_TYPE: 'nvarchar' }
                  { COLUMN_NAME: 'flag_general', DATA_TYPE: 'int' }
                  { COLUMN_NAME: 'flag_gran_chaco', DATA_TYPE: 'int' }
                  { COLUMN_NAME: 'flag_glad', DATA_TYPE: 'int' }
                  { COLUMN_NAME: 'flag_forma', DATA_TYPE: 'int' }
                  { COLUMN_NAME: 'flag_viirs', DATA_TYPE: 'int' }
                  { COLUMN_NAME: 'flag_terrai', DATA_TYPE: 'int' }
                  { COLUMN_NAME: 'ErrorDetails', DATA_TYPE: 'nvarchar' }
               */
              if (column.COLUMN_NAME === 'location_id') {
                col.value = primary_key;
              } else if (commodity && column.COLUMN_NAME === 'Commodity') {
                col.value = commodity;
              } else if (column.COLUMN_NAME === 'Geometry') {
                col.value = locationUtils.getWKTGeometry(req, feature.geometry);
              } else if (column.COLUMN_NAME === 'attributes') {
                col.type = sql.NVarChar(sql.MAX);
                col.value = '';
              } else if (column.COLUMN_NAME === 'ErrorDetails') {
                col.type = sql.NVarChar(256);
                col.value = '';
              } else if (column.COLUMN_NAME.includes('flag_')) {
                col.value = 0;
              }
            }
            row.push(col);
          });
          bulkUploadPayload.push(row);
          // Increment key for next feature
          primary_key += 1;
        });
        const columnNames = bulkUploadPayload[0].map((col) => col.field);
        const columnTypes = bulkUploadPayload[0].map((col) => col.type);
        const dataRows = bulkUploadPayload.map((row) => row.map((item) => item.value));

        return sqlUtils.executeOrganizationBulkUpload(
          req,
          list.list_table,
          true,
          columnNames,
          columnTypes,
          dataRows
        );
      })
      .then(() => {
        // Update number of locations in Lists table
        const sqlParameters = [
          { field: 'table_name', type: sql.NVarChar(150), value: list.list_table },
          { field: 'list_id', type: sql.Int, value: list_id },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspUpdateListCount',
          sqlParameters
        );
      })
      .then(() => {
        // Copy over list-<TABLE_NAME> ids to analysis-<TABLE_NAME>
        const sqlParameters = [
          { field: 'list_id', type: sql.Int, value: list_id },
          { field: 'start_location_id', type: sql.Int, value: max_id },
        ];
        return sqlUtils.executeOrganizationStoredProcedure(
          req,
          'uspAddNewLocationToAnalysisTable',
          sqlParameters
        );
      })
      .then((recordsets) => {
        logger.logActivity(
          req,
          logger.listActivityTypes.List.ListUpdate,
          `User ID'${req.session.organization_user_id}' has added new locations to list (${list.list_name}) Analysis Table.`
        );

        // Create geojson from recordsets
        const resultGeoJSON = locationUtils.createGeoJSON(req, recordsets);
        resolve(resultGeoJSON);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.ERROR_CODES.failedToAppendList,
          `Failed to append to ${list.list_table}`,
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
