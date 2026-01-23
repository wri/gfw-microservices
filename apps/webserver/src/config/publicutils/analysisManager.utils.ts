/* eslint new-cap: 0 */
/** ******************************************************************
 *   @name: analysisManager.utils.js
 *   @description : Manager file to control analysis and run each microservice
 *
 * @function {getAnalysisDataForUserList}
 * @function {getAnalysisDataForGFWList}
 * @function {getAnalysisDataForProtectedAreas}
 * @function {getAnalysisDataForProtectedAreasByLocationId}
 * @function {getGFWListAnalyses}
 * @function {getListAnalyses}
 * @function {requestAnalysis}
 * @function {getAFIAnalysisForListId}
 * @function {getAFINegligibleStatsForListId}
 * @function {getPaginatedAnalysisDataForProtectedAreas}
 *
 ********************************************************************/
import * as _ from 'lodash';
import * as sql from 'mssql';

import * as sqlUtils from '../privateutils/sql.utils';
import { createErrorMessage, ERROR_CODES } from '../privateutils/error.utils';
import * as analysisUtils from '../privateutils/analysis.utils';
import * as ListManager from '../publicutils/listManager.utils';
import {
  getAnalysisDataForProtectedAreasByLocation,
  GfwLists,
  SqlParamType,
  SQLUtils as SQLUtilsLibSql,
  getPaginatedLocationsByListIdSortedByFilters,
  PaginatedLocationsByListIdSortedByFilters,
  getPaginatedAfiAnalysisByListIdSortedByFilters,
  getPaginatedAlertsAnalysisByListIdSortedByFilters,
  PaginatedAfiAnalysisByListIdSortedByFilters,
  PaginatedAlertsAnalysisByListIdSortedByFilters,
  getDashboardDataPaginated,
  DashboardDataPaginated,
  CountDashboardDataType,
  getCountDashboardData,
  getListJsonAttributesColumnsSqlParam,
} from '@wri-monorepos/sql';

import { DIAGNOSTIC_ANALYSIS_PERIOD } from '@wri-monorepos/constants';
import { Logger } from '@nestjs/common';

/** @function {getAnalysisDataForUserList}
 *   @summary Function to return analysis data for a user list.
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of the user list in the database
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getAnalysisDataForUserList = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listID', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetAnalysisDataForUserList', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = createErrorMessage(
          req,
          ERROR_CODES.failedToGetList,
          'Failed to get user list analysis data',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getAnalysisDataForGFWList}
 *   @summary Function to return analysis data for a GFW list.
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of the GFW list in the database
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getAnalysisDataForGFWList = (req, list_id, location_ids = []) => {
  return new Promise<any>((resolve, reject) => {
    const parameters: SqlParamType[] = [{ field: 'list_id', type: sql.Int(), value: list_id }];

    if (Array.isArray(location_ids) && location_ids.length) {
      parameters.push({
        field: 'location_ids',
        type: sql.NVarChar(sql.MAX),
        value: location_ids.toString(),
      });
    }

    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetGFWListLocationAnalysis', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((err) => {
        const errorObject = createErrorMessage(
          req,
          ERROR_CODES.failedToGetList,
          'Failed to get GFW list analysis data',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * Get Analysis Data for Protected Areas
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} list_id - ID of the GFW list in the database
 * @param {Object} filters - Selected filters for Protected Areas
 * @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getAnalysisDataForProtectedAreas = (req, list_id, filters) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
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
      .executeSystemStoredProcedure(req, 'uspGetProtectedAreasListLocationAnalysis', parameters)
      .then((recordsets) => {
        const listDataFields = [
          'Country',
          'Designation',
          'Designation Type',
          'IUCN CAT',
          'Latitude',
          'Location Classification',
          'Location Name',
          'Longitude',
          'Size',
          'State',
          'Sub State',
          'gadmid',
          'globalid',
          'id_in_list',
          'location_id_in_list',
        ];

        const listData = recordsets.map((record) => {
          const pick = _.pick(record, listDataFields);
          return {
            ...pick,
            id: record.id_in_list,
            location_id: record.location_id_in_list,
          };
        });

        const protectedLocationResult = recordsets.map((record) => {
          return _.omit(record, listDataFields);
        });

        resolve({ listData, protectedLocationResult });
      })
      .catch((err) => {
        const errorObject = createErrorMessage(
          req,
          ERROR_CODES.failedToGetList,
          'Failed to get GFW list analysis data',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 * Get Analysis Data for Protected Areas
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {number} list_id - ID of the GFW list in the database
 * @param {Object} location_id - Selected location for Protected Areas
 * @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getAnalysisDataForProtectedAreasByLocationId = (req, list_id, location_id) => {
  return new Promise<any>((resolve, reject) => {
    const parameters = [
      { field: 'list_id', type: sql.Int, value: list_id },
      { field: 'location_id', type: sql.Int, value: location_id },
    ];

    sqlUtils
      .executeSystemQuery(getAnalysisDataForProtectedAreasByLocation, parameters)
      .then((recordsets) => {
        const listDataFields = [
          'Country',
          'Designation',
          'Designation Type',
          'IUCN CAT',
          'Latitude',
          'Location Classification',
          'Location Name',
          'Longitude',
          'Size',
          'State',
          'Sub State',
          'gadmid',
          'globalid',
          'id_in_list',
          'location_id_in_list',
        ];

        const listData = recordsets[0].map((record) => {
          const pick = _.pick(record, listDataFields);
          return {
            ...pick,
            id: record.id_in_list,
            location_id: record.location_id_in_list,
          };
        });

        const protectedLocationResult = recordsets[0].map((record) => {
          return _.omit(record, listDataFields);
        });

        resolve({ listData, protectedLocationResult });
      })
      .catch((err) => {
        const errorObject = createErrorMessage(
          req,
          ERROR_CODES.failedToGetList,
          'Failed to get GFW list analysis data',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {getGFWListAnalyses}
 *   @summary Function to return GFW list analysis.
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of list
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getGFWListAnalyses = (req, list_id) => {
  return new Promise<any>((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetListAnalysis', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        console.log('Error retrieving gfw list analysis', errorMessage);
        const message = createErrorMessage(
          req,
          ERROR_CODES.failedToGetList,
          'Failed to get gfw list analysis',
          errorMessage
        );
        reject(message);
      });
  });
};

/**
 * @function {getAFIAnalysisForListId}
 * @summary Function to return the AFIAnalysis
 * @param {Object} req – Request express object to extract organization information from
 * @param {Number} listId – List ID input
 * @returns {Promise<Object>}
 */
export const getAFIAnalysisForListId = (req, listId, locationId) => {
  return new Promise((resolve, reject) => {
    let queryName = 'uspGetAfiAnalysisForListId';
    const queryParams = [{ field: 'listId', type: sql.Int, value: listId }];

    if (locationId) {
      queryParams.push({ field: 'locationId', type: sql.Int, value: locationId });
      queryName = 'uspGetAfiAnalysisForListIdAndLocation';
    }

    sqlUtils
      .executeOrganizationStoredProcedure(req, queryName, queryParams)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((error) => {
        const errorMessage = createErrorMessage(
          req,
          ERROR_CODES.failedToGetAFIAnalysisForListId,
          `Failed to get afi analysis for list id = ${listId}`,
          error
        );
        reject(errorMessage);
      });
  });
};

/**
 * @function {getAFINegligibleStatsForListId}
 * @summary Function to return the AFIAnalysis Negligible Stats
 * @param {Object} req – Request express object to extract organization information from
 * @param {Number} listId – List ID input
 * @returns {Promise<Object>}
 */
export const getAFINegligibleStatsForListId = (req, listId, locationId) => {
  return new Promise((resolve, reject) => {
    let queryName = 'uspGetAfiNegligibleRiskStatsForListId';
    const queryParams = [{ field: 'listId', type: sql.Int, value: listId }];

    if (locationId) {
      queryParams.push({ field: 'locationId', type: sql.Int, value: locationId });
      queryName = 'uspGetAfiNegligibleRiskStatsForListIdAndLocation';
    }
    sqlUtils
      .executeOrganizationStoredProcedure(req, queryName, queryParams)
      .then((recordsets) => {
        resolve(recordsets[0]);
      })
      .catch((error) => {
        const errorMessage = createErrorMessage(
          req,
          ERROR_CODES.failedToGetAFINegligibleStatsForListId,
          `Failed to get afi negligible stats for list id = ${listId}`,
          error
        );
        reject(errorMessage);
      });
  });
};

/** @function {getListAnalyses}
 *   @summary Function to return list analysis.
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of list
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export const getListAnalyses = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListAnalysis', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        console.log('Error retrieving list analysis', errorMessage);
        const message = createErrorMessage(
          req,
          ERROR_CODES.failedToGetList,
          'Failed to get list analysis',
          errorMessage
        );
        reject(message);
      });
  });
};

/** @function {requestAnalysis}
 *   @summary Function to send SQS message to request analysis for later
 *   @param  {Object}    req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String}    list_name - Name of the list
 *   @param  {Object}    geojson - A geojson used for the analysis
 */
export const requestAnalysis = async (req, list_name, geojson: { type?: string } = {}) => {
  // Required to request analysis
  const organization_database = req.session.organization_database;

  // Returns list
  const list = await ListManager.getListByListName(req, list_name);

  // Determine if we're request location or list analysis
  if (typeof geojson === 'object' && Object.keys(geojson).length === 0) {
    // Perform a list analysis
    analysisUtils.analyzeList(req, list);
  } else if (geojson?.type === 'FeatureCollection') {
    // Perform a location analysis
    analysisUtils.analyzeLocation(req, organization_database, list, geojson);
  } else {
    createErrorMessage(req, ERROR_CODES.failedToGetList, 'Requesting unexpected analysis', '');
  }
};

export const formatNumber = (data, decimals = 2) => {
  const isFloat = (n) => Number(n) === n && n % 1 !== 0;

  if (data === undefined || data === null) {
    return data;
  }

  let newData = {};
  if (Array.isArray(data)) {
    newData = data.map((value) => {
      if (isFloat(value)) {
        return parseFloat(value.toFixed(decimals));
      }
      return value;
    });
  } else if (typeof data === 'object' && data !== null) {
    newData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'number' && isFloat(value)) {
        acc[key] = parseFloat(value.toFixed(decimals));
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
  return newData;
};

export async function getPaginatedAnalysisDataForProtectedAreas(
  list_id,
  pageNum,
  pageSize,
  filters,
  filterString,
  tableSortedBy,
  tableSortedDesc
) {
  const gfwLists = new GfwLists();
  return await gfwLists.getPaginatedAnalysisDataForProtectedAndAdministrativeAreas(
    list_id,
    pageNum,
    pageSize,
    filters,
    filterString,
    tableSortedBy,
    tableSortedDesc
  );
}

export async function getPaginatedAnalysisDataForAdministrativeAreas(
  list_id,
  pageNum,
  pageSize,
  filters,
  filterString,
  tableSortedBy,
  tableSortedDesc
) {
  const gfwLists = new GfwLists();
  return await gfwLists.getPaginatedAnalysisDataForProtectedAndAdministrativeAreas(
    list_id,
    pageNum,
    pageSize,
    filters,
    filterString,
    tableSortedBy,
    tableSortedDesc
  );
}
/** @function {getListAnalyses}
 *   @summary Function to return list analysis.
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of list
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
export async function getDraftListLocationData(list_id, page, pageSize, clientDatabase, filters) {
  const {
    orderType,
    sortByAttribute,
    searchString,
    country,
    state,
    subState,
    // commodity risk filters:
    selectedSupplier,
    selectedSecondSupplier,
    selectedParentCompany,
    showRSPOCertified,
    hasError,
  } = filters;

  const listJsonAttributes = await getListJsonAttributesColumnsSqlParam(clientDatabase, list_id);

  const parameters = [
    { field: 'listId', type: sql.Int, value: list_id },
    { field: 'rowsOfPage', type: sql.Int, value: pageSize },
    { field: 'pageNumber', type: sql.Int, value: page },
    { field: 'orderType', type: sql.NVarChar(255), value: orderType || 'ASC' },
    { field: 'selectedSupplier', type: sql.NVarChar(255), value: selectedSupplier || null },
    {
      field: 'selectedSecondSupplier',
      type: sql.NVarChar(255),
      value:
        selectedSecondSupplier !== '' && selectedSecondSupplier ? selectedSecondSupplier : null,
    },
    {
      field: 'selectedParentCompany',
      type: sql.NVarChar(255),
      value: selectedParentCompany !== '' && selectedParentCompany ? selectedParentCompany : null,
    },
    { field: 'showRSPOCertified', type: sql.Bit, value: showRSPOCertified || 0 },
    {
      field: 'SearchString',
      type: sql.NVarChar(255),
      value: searchString !== '' && searchString ? searchString : null,
    },
    {
      field: 'Country',
      type: sql.NVarChar(255),
      value: country !== '' && country ? country : null,
    },
    {
      field: 'State',
      type: sql.NVarChar(255),
      value: state !== '' && state ? state : null,
    },
    {
      field: 'SubState',
      type: sql.NVarChar(255),
      value: subState !== '' && subState ? subState : null,
    },
    {
      field: 'hasError',
      type: sql.Bit,
      value: hasError ? hasError : null,
    },
    {
      field: 'jsonAttributeColumns',
      type: sql.NVarChar(sql.MAX),
      value: listJsonAttributes,
    },
  ];

  parameters.push({
    field: 'sortByAttribute',
    type: sql.NVarChar(255),
    value: sortByAttribute,
  });

  const listAnalyses = await SQLUtilsLibSql.queryDB<PaginatedLocationsByListIdSortedByFilters[]>(
    clientDatabase,
    getPaginatedLocationsByListIdSortedByFilters,
    parameters
  );

  const numberOfResults = listAnalyses?.[0]?.totalRows;

  const formattedListAnalyses = listAnalyses.map((analysis) => {
    return {
      ...analysis,
      list_id: analysis.listId,
      location_id: analysis.locationId,
    };
  });

  return { listAnalyses: formattedListAnalyses, numberOfResults };
}

export async function getAFIListAnalyses(list_id, page, pageSize, clientDatabase, filters) {
  const {
    orderType,
    sortByAttribute,
    searchString,
    country,
    state,
    subState,
    hasError,

    // commodity risk filters:
    selectedSupplier,
    selectedSecondSupplier,
    selectedParentCompany,
    showRSPOCertified,
  } = filters;

  const parameters = [
    { field: 'listId', type: sql.Int, value: list_id },
    { field: 'rowsOfPage', type: sql.Int, value: pageSize },
    { field: 'pageNumber', type: sql.Int, value: page },
    { field: 'orderType', type: sql.NVarChar(255), value: orderType || 'ASC' },
    { field: 'selectedSupplier', type: sql.NVarChar(255), value: selectedSupplier || null },
    {
      field: 'selectedSecondSupplier',
      type: sql.NVarChar(255),
      value:
        selectedSecondSupplier !== '' && selectedSecondSupplier ? selectedSecondSupplier : null,
    },
    {
      field: 'selectedParentCompany',
      type: sql.NVarChar(255),
      value: selectedParentCompany !== '' && selectedParentCompany ? selectedParentCompany : null,
    },
    { field: 'showRSPOCertified', type: sql.Bit, value: showRSPOCertified || 0 },
    {
      field: 'SearchString',
      type: sql.NVarChar(255),
      value: searchString !== '' && searchString ? searchString : null,
    },
    {
      field: 'Country',
      type: sql.NVarChar(255),
      value: country !== '' && country ? country : null,
    },
    {
      field: 'State',
      type: sql.NVarChar(255),
      value: state !== '' && state ? state : null,
    },
    {
      field: 'SubState',
      type: sql.NVarChar(255),
      value: subState !== '' && subState ? subState : null,
    },
    {
      field: 'hasError',
      type: sql.Bit,
      value: hasError ? hasError : null,
    },
  ];

  parameters.push({
    field: 'sortByAttribute',
    type: sql.NVarChar(255),
    value: sortByAttribute,
  });

  const listJsonAttributes = await getListJsonAttributesColumnsSqlParam(clientDatabase, list_id);

  parameters.push({
    field: 'jsonAttributeColumns',
    type: sql.NVarChar(sql.MAX),
    value: listJsonAttributes,
  });

  const listAnalyses = await SQLUtilsLibSql.queryDB<PaginatedAfiAnalysisByListIdSortedByFilters[]>(
    clientDatabase,
    getPaginatedAfiAnalysisByListIdSortedByFilters,
    parameters
  );

  const numberOfResults = listAnalyses?.[0]?.totalRows;

  const formattedListAnalyses = listAnalyses.map((analysis) => {
    return {
      ...analysis,
      list_id: analysis.listId,
      location_id: analysis.locationId,
    };
  });

  return { listAnalyses: formattedListAnalyses, numberOfResults };
}

export async function getAlertsListAnalyses(list_id, page, pageSize, clientDatabase, filters) {
  const {
    orderType,
    sortByAttribute,
    searchString,
    country,
    state,
    subState,
    hasError,

    // commodity risk filters:
    selectedSupplier,
    selectedSecondSupplier,
    selectedParentCompany,
    showRSPOCertified,
  } = filters;

  const { END_YEAR } = DIAGNOSTIC_ANALYSIS_PERIOD;
  const startDate = `${END_YEAR + 1}-01-01`;
  const endDate = new Date().toISOString().split('T')[0];

  const parameters = [
    { field: 'listId', type: sql.Int, value: list_id },
    { field: 'rowsOfPage', type: sql.Int, value: pageSize },
    { field: 'pageNumber', type: sql.Int, value: page },
    { field: 'orderType', type: sql.NVarChar(255), value: orderType || 'ASC' },
    { field: 'selectedSupplier', type: sql.NVarChar(255), value: selectedSupplier || null },
    {
      field: 'selectedSecondSupplier',
      type: sql.NVarChar(255),
      value:
        selectedSecondSupplier !== '' && selectedSecondSupplier ? selectedSecondSupplier : null,
    },
    {
      field: 'selectedParentCompany',
      type: sql.NVarChar(255),
      value: selectedParentCompany !== '' && selectedParentCompany ? selectedParentCompany : null,
    },
    { field: 'showRSPOCertified', type: sql.Bit, value: showRSPOCertified || 0 },
    {
      field: 'SearchString',
      type: sql.NVarChar(255),
      value: searchString !== '' && searchString ? searchString : null,
    },
    {
      field: 'Country',
      type: sql.NVarChar(255),
      value: country !== '' && country ? country : null,
    },
    {
      field: 'State',
      type: sql.NVarChar(255),
      value: state !== '' && state ? state : null,
    },
    {
      field: 'SubState',
      type: sql.NVarChar(255),
      value: subState !== '' && subState ? subState : null,
    },
    {
      field: 'hasError',
      type: sql.Bit,
      value: hasError ? hasError : null,
    },
    {
      field: 'startDate',
      type: sql.Date,
      value: startDate,
    },
    {
      field: 'endDate',
      type: sql.Date,
      value: endDate,
    },
  ];

  parameters.push({
    field: 'sortByAttribute',
    type: sql.NVarChar(255),
    value: sortByAttribute,
  });

  const listJsonAttributes = await getListJsonAttributesColumnsSqlParam(clientDatabase, list_id);

  parameters.push({
    field: 'jsonAttributeColumns',
    type: sql.NVarChar(sql.MAX),
    value: listJsonAttributes,
  });

  const listAnalyses = await SQLUtilsLibSql.queryDB<
    PaginatedAlertsAnalysisByListIdSortedByFilters[]
  >(clientDatabase, getPaginatedAlertsAnalysisByListIdSortedByFilters, parameters);

  const numberOfResults = listAnalyses?.[0]?.totalRows;

  const formattedListAnalyses = listAnalyses.map((analysis) => {
    return {
      ...analysis,
      list_id: analysis.listId,
      location_id: analysis.locationId,
    };
  });

  return { listAnalyses: formattedListAnalyses, numberOfResults };
}
