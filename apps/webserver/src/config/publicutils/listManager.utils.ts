/* eslint new-cap: 0 */
/** ******************************************************************
 *   @name : listManager.utils.js
 *   @description : A utility file to allow GFW Pro to obtain/set
 *                 list data.
 *
 * @function {getUserLists}
 * @function {getUserListsWithAnalysisId}
 * @function {rerunExistingList}
 * @function {getAllLists}
 * @function {getListLocations}
 * @function {getSimplifiedListLocations}
 * @function {getListLocationsNoGeom}
 * @function {getLocationsCount}
 * @function {uploadToExistingList}
 * @function {updateIndividualLocationsStatusID}
 * @function {deleteLocations}
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
 * @function {getListStatusCommonName}
 * @function {getPaginatedAnalysisDataForUserList}
 * @function {getNumberPagesForAnalysisDataUserList}
 * @function {getListLocationGeometry}
 * @function {deleteListIfEmpty}
 * @function {getAllListsWithAnalysisId}
 * @function {getWorstStatusId}
 *
 ******************************************************************* */
// Imports required for this module.
import sql from 'mssql';
import _ from 'lodash';

// Configs
import config from '../config';
import { DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED } from '../config/locations.config';
// const LIST_UPLOAD_LEGACY_VERSION = 0;

// Utils
import * as sqlUtils from '../privateutils/sql.utils';
import * as logger from '../privateutils/logger.utils';
import * as listUtils from '../privateutils/list.utils';
import * as errorUtils from '../privateutils/error.utils';
import * as analysisUtils from '../privateutils/analysis.utils';
import * as locationUtils from '../privateutils/location.utils';
import { listStatusOrderByWorse } from '../env/listStatuses.constants';
import { listStatus } from '@wri-monorepos/constants';
import {
  AnalysisDataType,
  ListsType,
  DeleteListTypeOrm,
  getListJsonAttributesColumnsSqlParam,
  getAllLists as getAllListsSql,
  getUserLists as getUsersListSql,
} from '@wri-monorepos/sql';
import type { ListsAnalysisStatus } from '@wri-monorepos/sql';

const FIFTEEN_MINUTES_MS = 900000;

/**
 * Helper to create commodity risk filter parameters
 * Used by getPaginatedAnalysisDataForUserList and getNumberPagesForAnalysisDataUserList
 */
const createCommodityRiskFilterParams = (filters) => [
  { field: 'selectedSupplier', type: sql.NVarChar(255), value: filters.selectedSupplier || null },
  {
    field: 'selectedSecondSupplier',
    type: sql.NVarChar(255),
    value: filters.selectedSecondSupplier || null,
  },
  {
    field: 'selectedParentCompany',
    type: sql.NVarChar(255),
    value: filters.selectedParentCompany || null,
  },
  { field: 'showRSPOCertified', type: sql.Bit, value: filters.showRSPOCertified || null },
  {
    field: 'selectedOverallThreats',
    type: sql.NVarChar(255),
    value: JSON.stringify(filters.selectedOverallThreats) || null,
  },
  {
    field: 'selectedOverallValues',
    type: sql.NVarChar(255),
    value: JSON.stringify(filters.selectedOverallValues) || null,
  },
  {
    field: 'selectedMillPriority',
    type: sql.NVarChar(255),
    value: JSON.stringify(filters.selectedMillPriority) || null,
  },
];

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

/**
 * Helper function to validate list lock status
 * @param {Object} record - Lock status record from getListLockStatus
 * @param {number} currentUserId - Current user's organization_user_id
 * @returns {boolean} true if list is locked by current user, throws error otherwise
 * @throws {{ isLocked: boolean, lock_user_id: number }} if list is locked by another user or unlocked
 */
const validateListLockStatus = (
  record: { lock_status; lock_user_id },
  currentUserId: number
): boolean => {
  const { lock_status, lock_user_id } = record;
  // List is unlocked or locked by another user
  if (lock_status === null || (lock_status !== null && lock_user_id !== currentUserId)) {
    throw { isLocked: true, lock_user_id };
  }
  return true;
};

/**
 * Get user lists with optional filtering by list ID
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} listId - Optional list ID to filter by
 * @returns {Promise<ListsType[]>} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getUserLists = async (req, listId = null): Promise<ListsType[]> => {
  try {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
    // A Super Admin or an Organization Admin are able to view all lists
    if (
      req.session.ispromanager ||
      req.session.user_access_level_id === config.platformVars.accessLevel.Administrator
    ) {
      return await sqlUtils.executeOrganizationStoredProcedure(req, getAllListsSql, parameters);
    } else {
      parameters.push({
        field: 'user_id',
        type: sql.Int,
        value: req.session.organization_user_id,
      });
      return await sqlUtils.executeOrganizationStoredProcedure(req, getUsersListSql, parameters);
    }
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      'Failed to get lists for user',
      errorMessage
    );
    throw errorObject;
  }
};

export const mergeListsWithAnalysisId = (
  lists: ListsType[],
  listAnalysisStatuses: ListsAnalysisStatus[]
) => {
  // Mutate lists in place to maintain backward compatibility
  for (const list of lists) {
    const listAnalysesStatus = listAnalysisStatuses.filter(
      (analysis) => analysis.listId == list.id
    );

    // get the worst status from the list analysis status to replace list level status
    const worstStatus = getWorstStatusId(listAnalysesStatus);

    list.listAnalysesStatus = listAnalysesStatus;
    // replace the list level status with the worst from the list analysis status,
    // or continue with the one that already had.
    list.list_status_id = worstStatus ?? list.list_status_id;
  }
};

export const setWorstStatusId = (lists: ListsType[]) => {
  // Mutate lists in place to maintain backward compatibility
  for (const list of lists) {
    const listAnalysesStatus = JSON.parse(list.listAnalysesStatus as unknown as string) || [];
    list.listAnalysesStatus = listAnalysesStatus;
    if (!listAnalysesStatus || !listAnalysesStatus.length) {
      continue;
    }
    const worstStatus = getWorstStatusId(listAnalysesStatus);
    if (worstStatus === undefined) {
      continue;
    }
    // Update status to worst analysis status if available, otherwise keep current status
    list.list_status_id = worstStatus ?? list.list_status_id;
  }
};

/**
 * Get user lists with analysis ID status information
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} listId - Optional list ID to filter by
 * @returns {Promise<ListsType[]>} Returns promise with lists including analysis status
 */
export const getUserListsWithAnalysisId = async (req, listId = null): Promise<ListsType[]> => {
  try {
    const userLists = await getUserLists(req, listId);
    setWorstStatusId(userLists);

    return userLists.map((list) => {
      list.isGlobalForestWatchList = false;
      return list;
    });
  } catch (error) {
    logger.error('getUserListsWithAnalysisId', error.stack || error);
    throw error;
  }
};

/** @function {rerunExistingList}
 *   @summary Function to rerun location and list analyses
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const rerunExistingList = async (req) => {
  try {
    logger.debug('listManager --->>> rerunExistingList');
    const { list_name, list_locations_count } = req.body;

    // Returns list_name, list_table, analysis_table
    const list = listUtils.createListNameSchema(list_name);
    await analysisUtils.analyzeList(req, list);

    logger.logActivity(
      req,
      logger.listActivityTypes.List.ListAnalyzing,
      `User ID ${req.session.organization_user_id} started analysis rerun process for ${list_locations_count} locations`
    );
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      'Failed to run the re-run stored procedure...',
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * Get all lists for the organization
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @returns {Promise<ListsType[]>} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getAllLists = async (req): Promise<ListsType[]> => {
  try {
    // call organizational stored procedure to return all lists tied to the organization.
    const parameters = [{ field: 'list_id', type: sql.Int, value: null }];
    return await sqlUtils.executeOrganizationStoredProcedure(req, getAllListsSql, parameters);
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      'Failed to get all lists for the organization.',
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * Get all lists with analysis ID status information
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @returns {Promise} Returns promise with all lists including analysis status
 */
export const getAllListsWithAnalysisId = async (req) => {
  try {
    const orgLists = await getAllLists(req);
    setWorstStatusId(orgLists);
    return orgLists;
  } catch (error) {
    logger.error('getAllListsWithAnalysisId', error.stack || error);
    throw error;
  }
};

/**
 * Get the worst (highest priority) status ID from list of analysis IDs
 * @param {Array} analysisIds - Array of analysis IDs with status information
 * @returns {Number|undefined} The worst status ID or undefined if no valid status found
 */
export const getWorstStatusId = (analysisIds) => {
  // get all status from the analysis list

  if (!analysisIds || !analysisIds.length || analysisIds === null) {
    return undefined;
  }

  // Check if analysisIds is a string and parse it if needed
  const parsedAnalysis = typeof analysisIds === 'string' ? JSON.parse(analysisIds) : analysisIds;
  const analysisStatus = parsedAnalysis.map((analysisId) => analysisId.status);

  // iterate over status ordered by worse to better and return
  // the fist that exist inside the analysis list
  for (const status of listStatusOrderByWorse) {
    if (analysisStatus.includes(status)) {
      return status;
    }
  }
  return undefined;
};

/**
 * Get list locations as GeoJSON with pagination
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} list_id - Unique list id of the list.
 * @param {Number} location_id - Location ID for pagination cursor (default: 0)
 * @param {Number} rowsRequested - Number of rows to return (default: DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED)
 * @returns {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
export const getListLocations = async (
  req,
  list_id,
  location_id = 0,
  rowsRequested: number = DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED
) => {
  try {
    const parameters = [
      { field: 'listID', type: sql.Int, value: list_id },
      { field: 'locationID', type: sql.Int, value: location_id },
      { field: 'rowsRequested', type: sql.Int, value: rowsRequested },
    ];

    const recordsets = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetListLocations',
      parameters
    );

    if (recordsets) {
      const geojson = locationUtils.createGeoJSON(req, recordsets);
      return geojson;
    } else {
      const errorObject = errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.failedToGetList,
        `Failed to get list locations for List ${list_id}`,
        JSON.stringify({ errorLocation: 'getListLocations()' })
      );
      throw errorObject;
    }
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      `Failed to get list locations for List ${list_id}`,
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * Get simplified list locations (without full geometry details)
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} list_id - Unique list id of the list.
 * @returns {Promise} Returns promise object. If successful, an array of geojson, otherwise, error object
 */
export const getSimplifiedListLocations = async (req, list_id) => {
  try {
    const parameters = [{ field: 'listID', type: sql.Int, value: list_id }];
    const recordsets = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetSimplifiedListLocations',
      parameters
    );
    const geojson = locationUtils.createGeoJSON(req, recordsets);
    return geojson;
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      `Failed to get list locations for List ${list_id}`,
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * @function {getListLocationsNoGeom}
 * @summary Get function to return json of location metadata without geometry.
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} listID - Unique list id of the list.
 * @param {String} columnsToReturn - Comma separated list of columns to return.
 * @return {Promise<[]>} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getListLocationsNoGeom = async (req, listID, columnsToReturn = null): Promise<[]> => {
  try {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'ColumnsToReturn', type: sql.NVarChar(255), value: columnsToReturn },
    ];
    return await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetListLocationsNoGeom',
      parameters
    );
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      `Failed to get list location (no Geom) for List ${listID}`,
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * @typedef {Object} Filters
 * @param {string} country - Country name (e.g. 'Brazil')
 * @param {string} state - State name (e.g. 'Bahia')
 * @param {string} state - SubState name (e.g. 'Barreiras')
 * @param {number} page - Page number (e.g. 1)
 * @param {number} pageSize - Number of rows per page (e.g. 50)
 * @param {string} orderType - Sort order (e.g. 'asc' or 'desc')
 * @param {number} analysisAreaMin - Minimum analysis area (e.g. 0)
 * @param {string} columnsToReturn - Columns to return (e.g. 'Location Name,Commodity,State,Certification')
 * @param {string} LocationIds - Location ids to filter by (e.g. '1,2,3' or '1 AND 5, 6 AND 10' )
 * @param {string} LocationLogic - Location logic to filter by (e.g. 'IN', 'NOT IN' or 'BETWEEN')
 */

/**
 * @function {getPaginatedAnalysisDataForUserList}
 * @summary Get function to return json of paginated location metadata with geometry.
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} listID - Unique list id of the list.
 * @param {Filters} filters - Array of filters to apply to the query.
 * @return {Promise<[]>} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getPaginatedAnalysisDataForUserList = async (
  req,
  listID,
  filters
): Promise<AnalysisDataType[]> => {
  let { searchString, country, state, subState } = filters;
  const {
    page,
    pageSize,
    orderType,
    sortByAttribute,
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

  try {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'PageNumber', type: sql.Int, value: page || null },
      { field: 'RowsOfPage', type: sql.Int, value: pageSize || null },
      { field: 'OrderByColumn', type: sql.NVarChar(255), value: sortByAttribute || null },
      { field: 'Order', type: sql.NVarChar(255), value: orderType || null },
      { field: 'SearchString', type: sql.NVarChar(255), value: searchString || null },
      { field: 'Country', type: sql.NVarChar(255), value: country || null },
      { field: 'State', type: sql.NVarChar(255), value: state || null },
      { field: 'SubState', type: sql.NVarChar(255), value: subState || null },
      { field: 'analysisAreaMin', type: sql.Int, value: analysisAreaMin || null },
      // Calculated Sourcing Area filter removed (GPV-1274); proc param retained as no-op until DB cleanup.
      { field: 'analysisAreaMax', type: sql.Int, value: null },
      { field: 'ColumnsToReturn', type: sql.NVarChar(255), value: columnsToReturn },
      { field: 'LocationIds', type: sql.NVarChar(255), value: LocationIds },
      { field: 'LocationLogic', type: sql.NVarChar(255), value: LocationLogic },
      { field: 'LocationStatement', type: sql.NVarChar(255), value: LocationStatement || null },
      { field: 'Geometry', type: sql.Bit, value: geometry || 0 },
      // commodity risk filters
      ...createCommodityRiskFilterParams(filters),
    ];

    const { organization_database: clientDatabase } = req.session;
    const listJsondAttributes = await getListJsonAttributesColumnsSqlParam(clientDatabase, listID);

    parameters.push({
      field: 'jsonAttributeColumns',
      type: sql.NVarChar(sql.MAX),
      value: listJsondAttributes,
    });

    return await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetPaginatedAnalysisDataForUserList',
      parameters
    );
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      `Failed to get paginated list location for List ${listID}`,
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * Get number of pages for paginated analysis data
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} list_id - Unique list id of the list.
 * @param {Object} filters - Filter criteria to determine page count
 * @returns {Promise<Object>} Returns promise with numberOfPages and numberOfResults
 */
export const getNumberPagesForAnalysisDataUserList = async (req, list_id, filters) => {
  try {
    const {
      pageSize,
      searchString,
      country,
      state,
      subState,
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
      { field: 'searchString', type: sql.NVarChar(255), value: searchString || null },
      { field: 'Country', type: sql.NVarChar(255), value: country || null },
      { field: 'State', type: sql.NVarChar(255), value: state || null },
      { field: 'SubState', type: sql.NVarChar(255), value: subState || null },
      { field: 'analysisAreaMin', type: sql.Int, value: analysisAreaMin || null },
      // Calculated Sourcing Area filter removed (GPV-1274); proc param retained as no-op until DB cleanup.
      { field: 'analysisAreaMax', type: sql.Int, value: null },
      // commodity risk filters
      ...createCommodityRiskFilterParams(filters),
    ];

    const recordsets = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetAnalysisDataCountForUserList',
      parameters
    );

    const totalRows = recordsets.find((record) => record.statistic_type === 'Row Count').statistic;
    let numberOfPages = 2;
    if (totalRows) {
      numberOfPages = pageSize ? Math.ceil(totalRows / pageSize) : 1;
    }
    return {
      numberOfPages,
      numberOfResults: totalRows,
    };
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetList,
      `Failed to get number of pages for List ${list_id}`,
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * Get total locations count for user or organization
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @returns {Promise} Returns promise object with location count statistics
 */
export const getLocationsCount = async (req) => {
  try {
    // Retrieve user access level
    const { user_access_level_id, organization_database, organization_user_id } = req.session;
    const parameters = [
      { field: 'org_db', type: sql.NVarChar(255), value: req.session.organization_database },
    ];

    let recordsets;
    if (user_access_level_id === config.platformVars.accessLevel.Administrator) {
      recordsets = await sqlUtils.executeSystemStoredProcedure(
        req,
        'uspGetLocationsCount',
        parameters
      );
    } else {
      parameters.push({ field: 'user_id', type: sql.Int as any, value: organization_user_id });
      recordsets = await sqlUtils.executeSystemStoredProcedure(
        req,
        'uspGetLocationsCountEditor',
        parameters
      );
    }

    const [record] = recordsets;
    return record;
  } catch (errorMessage) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetLocationsCount,
      'Failed to get list locations count',
      errorMessage
    );
    throw errorObject;
  }
};

/**
 * Add locations and attributes to existing list
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} list_id - List ID to upload to
 * @param {String} list_name - Name of the list
 * @param {Object} geojson - A geojson object with array of features that contain geometry and properties
 * @param {String} commodity - Commodity type
 * @param {Object} attributes - Additional attributes for locations
 * @returns {Promise} Returns result from uploadBulkLocations
 */
export const uploadToExistingList = async (
  req,
  list_id,
  list_name,
  geojson,
  commodity,
  attributes
) => {
  try {
    return await listUtils.uploadBulkLocations(
      req,
      list_id,
      list_name,
      geojson,
      commodity,
      attributes
    );
  } catch (err) {
    throw err;
  }
};

/**
 * Update status ID for individual locations in bulk
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} list_analysis_table_name - List analysis table name (eg. "analysis-recentcocoageneric9")
 * @param {String|Number|Array} location_id - Location status id or ids (eg. 9 || [8, 9, 10])
 * @param {Number} location_status_id - Location status ID (eg. 4)
 * @returns {Promise<Boolean>} Returns true if successful
 */
export const updateIndividualLocationsStatusID = async (
  req,
  list_analysis_table_name,
  location_id,
  location_status_id
) => {
  try {
    const sqlParameters = [
      { field: 'analysis_table_name', type: sql.NVarChar(150), value: list_analysis_table_name },
      { field: 'location_ids_array', type: sql.NVarChar(sql.MAX), value: location_id.toString() },
      { field: 'location_status_id', type: sql.Int, value: location_status_id },
    ];
    await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspUpdateLocationAnalysisStatusInBulk',
      sqlParameters
    );
    logger.logActivity(
      req,
      logger.listActivityTypes.List.ListUpdateNew,
      `User ID ${req.session.organization_user_id} updated list analysis table locations with status ID (${location_status_id}).`
    );
    return true;
  } catch (errorMessage) {
    errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToUploadToNewList,
      `Updating list locations status IDs failed for analysis table (${list_analysis_table_name}).`,
      errorMessage
    );
    throw 'Update Individual Locations Status ID FAILED';
  }
};

/** @function {deleteLocations}
 *   @summary Deletes locations from a list
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id
 *   @param {Array} location_ids
 *   @param  {Number} gfw_list_id
 *   @return {Promise}
 */
export const deleteLocations = async (req, list_id, location_ids, gfw_list_id) => {
  try {
    // 1. Validate list is locked by current user
    const record = await getListLockStatus(req, list_id);
    validateListLockStatus(record, req.session.organization_user_id);

    // 2. Get list schema
    const list = await listUtils.getListNameSchema(req, list_id);

    // 3. Delete list locations sequentially
    for (const location_id of location_ids) {
      await listUtils.deleteSingleLocation(req, list, location_id);
    }

    // 4. Update list count of deleted location
    const parameters = [
      { field: 'table_name', type: sql.NVarChar(150), value: list.list_table },
      { field: 'list_id', type: sql.Int, value: list.id },
    ];
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspUpdateListCount', parameters);

    // 5. Unlock list to allow further interaction
    await setListUnlocked(req, list_id);

    // 6. Set list status to DRAFT
    await resetListStatus(req, list_id, gfw_list_id, listStatus.Draft);

    logger.logActivity(
      req,
      logger.listActivityTypes.List.LocationDeletedFromList,
      `Locations with IDs (${location_ids}) deleted from (${list.list_name})`
    );

    return true;
  } catch (err) {
    console.log('Error in deleting location', err);
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeleteList,
      `Failed to delete locations from list id ${list_id}`,
      err
    );
    throw errorObject;
  }
};

/**
 * Edit attributes for locations in a list
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} list_id - ID of list containing locations to edit
 * @param {Array} location_ids - Array of location_ids to edit
 * @param {Array} arrayAttributes - Array of objects containing key:value pairs of column: value
 * @returns {Promise<Boolean>} Returns true if successful
 */
export const editLocations = async (req, list_id, location_ids, arrayAttributes) => {
  // Confirm length of features and src_location_ids match
  if (location_ids.length !== arrayAttributes.length) {
    throw new Error('Length of arguments do not match.');
  }

  try {
    // Validate list is locked by current user
    const record = await getListLockStatus(req, list_id);
    validateListLockStatus(record, req.session.organization_user_id);

    // Edit locations sequentially
    for (let idx = 0; idx < location_ids.length; idx++) {
      const location_id = location_ids[idx];
      const location = arrayAttributes[idx];

      const locationTransformedKeysToLowerCase: Record<string, any> = _.transform(
        location,
        (result: Record<string, any>, val, key) => {
          // eslint-disable-next-line no-param-reassign
          result[String(key).toLowerCase()] = val;
        },
        {}
      );

      const locationAttributesFiltered = _.omit(
        locationTransformedKeysToLowerCase,
        EDIT_EXCLUDED_COLUMNS
      );

      await listUtils.editSingleLocation(req, list_id, location_id, locationAttributesFiltered);
    }

    logger.logActivity(
      req,
      logger.listActivityTypes.List.LocationUpdatedInList,
      'Locations have been updated.'
    );

    return true;
  } catch (err) {
    console.log('Error editing location', err);
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToUpdateLists,
      `Failed to update locations from list id ${list_id}`,
      err
    );
    throw errorObject;
  }
};

/** @function {copyLocations}
 *   @summary Copies location to list
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number} src_list_id
 *   @param  {Array}  src_location_ids
 *   @param  {Number} dest_list_id
 *   @param  {Object} src_geojson
 *   @param  {Number} gfw_list_id
 *   @return {Promise}
 */
export const copyLocations = async (
  req,
  src_list_id,
  src_location_ids,
  dest_list_id,
  src_geojson,
  gfw_list_id
) => {
  // Confirm length of features and src_location_ids match
  if (src_location_ids.length !== src_geojson.features.length) {
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedTocopyLocations,
      `Failed to copy locations from list id ${src_list_id} to list id ${dest_list_id}`,
      'Length mismatch between location IDs and GeoJSON features'
    );
  }

  try {
    // Get both list schemas in parallel
    const [src_list, dest_list] = await Promise.all([
      listUtils.getListNameSchema(req, src_list_id),
      listUtils.getListNameSchema(req, dest_list_id),
    ]);

    // Validate list is locked by current user
    const record = await getListLockStatus(req, src_list_id);
    validateListLockStatus(record, req.session.organization_user_id);

    // Lock the destination list from any other transactions
    await setListLocked(req, dest_list_id);

    // Perform uploadBulkLocations
    const commodity = null;
    const attributes = null;
    const resultGeoJSON = await listUtils.uploadBulkLocations(
      req,
      dest_list.id,
      dest_list.list_name,
      src_geojson,
      commodity,
      attributes
    );

    // Array of destination location ids - assumption that it is in the same order as src_locations_ids
    const dest_location_ids = resultGeoJSON.features.map(
      (feature) => feature.properties.location_id
    );

    // Get analysis columns to be copied
    const parameters = [{ field: 'list_id', type: sql.Int, value: src_list.id }];
    const recordsets = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetAnalysisColumns',
      parameters
    );

    const columns = recordsets.map((record) => record.COLUMN_NAME);
    const statement = columns
      .map((column) => `[${column}] = [${src_list.analysis_table}].[${column}]`)
      .join(',');

    // Copy single location analysis sequentially
    for (let idx = 0; idx < src_location_ids.length; idx++) {
      const src_location_id = src_location_ids[idx];
      await listUtils.copySingleLocation(
        req,
        src_list,
        dest_list,
        src_location_id,
        dest_location_ids[idx],
        statement
      );
    }

    // Update list count of appended location
    const updateParams = [
      { field: 'table_name', type: sql.NVarChar(150), value: dest_list.list_table },
      { field: 'list_id', type: sql.Int, value: dest_list.id },
    ];
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspUpdateListCount', updateParams);

    // Unlock both lists in parallel
    await Promise.all([setListUnlocked(req, src_list_id), setListUnlocked(req, dest_list_id)]);

    // Set list status to processing before requesting list level analysis
    await resetListStatus(req, dest_list_id, gfw_list_id, req.body.list_status_id);

    // Run analysis for entire list
    await AnalysisManager.requestAnalysis(req, dest_list.list_name, {});

    logger.logActivity(
      req,
      logger.listActivityTypes.List.LocationCopiedToList,
      `User ID ${req.session.organization_user_id} copied locations between lists`
    );

    return true;
  } catch (err) {
    console.log('Error copying location', err);
    // Unlock both lists in parallel on error
    await Promise.all([setListUnlocked(req, dest_list_id), setListUnlocked(req, src_list_id)]);

    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedTocopyLocations,
      `Failed to copy locations from list id ${src_list_id} to list id ${dest_list_id}`,
      err
    );
    throw errorObject;
  }
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
export const moveLocations = async (
  req,
  src_list_id,
  src_location_ids,
  dest_list_id,
  geojson,
  gfw_list_id,
  delete_src_list
) => {
  try {
    // Get both list schemas in parallel
    const [src_list, dest_list] = await Promise.all([
      listUtils.getListNameSchema(req, src_list_id),
      listUtils.getListNameSchema(req, dest_list_id),
    ]);

    // 1. Run copy location
    await copyLocations(req, src_list_id, src_location_ids, dest_list_id, geojson, gfw_list_id);

    // 2. Lock source list
    await setListLocked(req, src_list_id);

    // 3. Delete source list or locations
    if (delete_src_list) {
      await deleteList(req, src_list_id);
    } else {
      await deleteLocations(req, src_list_id, src_location_ids, gfw_list_id);
    }

    // 4. Log activities
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

    return true;
  } catch (err) {
    console.log('Error moving location', err);
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToMoveLocations,
      `Failed to move locations from list id ${src_list_id} to list id ${dest_list_id}`,
      err
    );
    throw errorObject;
  }
};

/** @function {getListLockStatus}
 *   @summary Gets current lock status of specified list
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Number} list_id - id of list to be locked
 *   @return {Promise}
 */
export const getListLockStatus = async (req, list_id): Promise<{ lock_status; lock_user_id }> => {
  try {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    const recordsets = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetListLockStatus',
      parameters
    );
    const [record] = recordsets;
    return record;
  } catch (err) {
    console.log('Issue getting list lock status', err);
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetLockStatus,
      `Failed to get lock state for list id ${list_id}`,
      err
    );
    throw errorObject;
  }
};

/**
 * Get List by List Name
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {string} list_name - List Name
 * @return {Promise<*>} - Filtered list from array of all lists
 */
export const getListByListName = async (req, list_name) => {
  try {
    const allLists = await getAllLists(req);
    return allLists.find((list) => list.list_name === list_name);
  } catch (e) {
    console.log('getListByListName', e);
  }
};

/**
 * Get list by ID with analysis status
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} listId - List ID to retrieve
 * @returns {Promise<Object|Array>} Returns single list if listId provided, otherwise array of lists
 */
export const getListByIdWithAnalysisId = async (req, listId) => {
  try {
    const lists = await getUserListsWithAnalysisId(req, listId);
    return listId ? lists[0] : lists;
  } catch (e) {
    logger.error('getListByIdWithAnalysisId', e.stack || e);
  }
};

/**
 * Check list lock status and auto-unlock if expired (>15 min)
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Number} list_id - ID of list to check lock status
 * @param {Object} record - Result of getListLockStatus containing lock_status and lock_user_id
 * @returns {Promise<Object>} Returns object with isLocked boolean and lock_user_id
 */
export const checkListLockStatus = async (req, list_id, record) => {
  try {
    const { lock_status, lock_user_id } = record;

    // List is unlocked
    if (lock_status === null) {
      await setListLocked(req, list_id);
      return {
        isLocked: false,
        lock_user_id,
      };
    }

    // Check if lock expired (>15 minutes)
    const now = new Date().getTime();
    const pastFifteen = now - lock_status > FIFTEEN_MINUTES_MS;

    if (pastFifteen) {
      await setListUnlocked(req, list_id);
      await setListLocked(req, list_id);
      return {
        isLocked: false,
        lock_user_id,
      };
    } else {
      return {
        isLocked: true,
        lock_user_id,
      };
    }
  } catch (err) {
    const errorMessage = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetLockStatus,
      `Failed to set lock list ${list_id}`,
      err
    );
    throw { error: true, errorMessage };
  }
};

/**
 * Lock a list for the current user
 */
export const setListLocked = async (req, list_id) => {
  try {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
    ];
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspSetListLocked', parameters);
    return true;
  } catch (err) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetLockStatus,
      `Failed to lock list id ${list_id}`,
      err
    );
    throw errorObject;
  }
};

/**
 * Unlock a list
 */
export const setListUnlocked = async (req, list_id) => {
  try {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'user_id', type: sql.NVarChar(150), value: undefined },
    ];
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspSetListUnlocked', parameters);
    return true;
  } catch (err) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetLockStatus,
      `Failed to unlock list id ${list_id}`,
      err
    );
    throw errorObject;
  }
};

/**
 * Reset list status (default: Draft)
 */
export const resetListStatus = async (
  req,
  list_id,
  gfw_list_id,
  list_status_id = listStatus.Draft
) => {
  let list_name = '';
  try {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'status_id', type: sql.Int, value: list_status_id },
      { field: 'associated_gfwlist', type: sql.TinyInt, value: gfw_list_id },
    ];

    const listStatusCommonName = getListStatusCommonName(list_status_id);
    const listInfo = await listUtils.getListNameSchema(req, list_id);
    list_name = listInfo.list_name;

    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspResetListStatus', parameters);

    logger.logActivity(
      req,
      logger.listActivityTypes.List.ListUpdate,
      `${list_name} is now ${listStatusCommonName}`
    );
    return true;
  } catch (error) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetLockStatus,
      `Error sending ${list_name} to analysis`,
      error
    );
    throw errorObject;
  }
};

/**
 * Delete a list and its associated data
 */
export const deleteList = async (req, list_id) => {
  try {
    await deleteListSqlLib(req, list_id);
    return true;
  } catch (err) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeleteList,
      `Failed to delete list id ${list_id}`,
      err
    );
    throw errorObject;
  }
};

/**
 * Get list status common name from status ID
 */
export const getListStatusCommonName = (statusId) => {
  const entry = Object.entries(listStatus).find(([key, value]) => value === statusId);
  return entry ? entry[0] : undefined;
};

/**
 * Get location geometry from list
 */
export async function getListLocationGeometry(req) {
  const { listTableName, locationID } = req.body;

  const parameters = [
    { field: 'list_table', type: sql.NVarChar(150), value: listTableName },
    { field: 'location_id', type: sql.Int, value: locationID },
  ];

  return await sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetLocation', parameters);
}

/**
 * Delete list if it contains no locations
 */
export async function deleteListIfEmpty(req, listID) {
  try {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listID }];
    const records = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspCheckIfListIsEmpty',
      parameters
    );

    const [resultset] = records;
    const { isListEmpty } = resultset;

    if (isListEmpty) {
      await deleteListSqlLib(req, listID);
      logger.logActivity(
        req,
        logger.listActivityTypes.List.ListDeleted,
        `Deleted empty list with id (${listID}).`
      );
      return true;
    }

    return isListEmpty;
  } catch (error) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeleteListIsNotEmpty,
      `Failed to delete list is not empty ${listID}`,
      error
    );
    throw errorObject;
  }
}

/**
 * Get list admin areas grouped by country
 */
export const getListAdminAreasOrderedByCountry = async (request, listId) => {
  try {
    const parameters = [{ field: 'listID', type: sql.Int, value: listId }];
    return await sqlUtils.executeOrganizationStoredProcedure(
      request,
      'uspGetAdminAreas',
      parameters
    );
  } catch (error) {
    const errorObject = errorUtils.createErrorMessage(
      request,
      errorUtils.ERROR_CODES.failedToGetList,
      `Failed to Get list admin areas ordered by country for list ${listId}`,
      error
    );
    throw errorObject;
  }
};

import * as AnalysisManager from './analysisManager.utils';

/**
 * Delete list with validation and logging (internal implementation)
 */
export const deleteListSqlLib = async (req, list_id) => {
  try {
    const { organization_user_id, organization_database: organizationDatabase } = req.session;
    const deleteListTypeOrm = new DeleteListTypeOrm();

    // Validate list is locked by current user
    const record = await getListLockStatus(req, list_id);
    validateListLockStatus(record, organization_user_id);

    // Get list schema
    const list = await listUtils.getListNameSchema(req, list_id);

    // Delete the list
    await deleteListTypeOrm.delete(organizationDatabase, list_id, organization_user_id);

    logger.logActivity(
      req,
      logger.listActivityTypes.List.ListDeleted,
      `User ID '${req.session.organization_user_id}' has deleted list (${list.list_name}).`
    );

    return true;
  } catch (err) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToDeleteList,
      `Failed to delete list id ${list_id}`,
      err
    );
    throw errorObject;
  }
};
