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
 * @function {requestDashboardAnalysis}
 * @function {getAFIAnalysisForListId}
 * @function {getAFINegligibleStatsForListId}
 *
 ********************************************************************/
const developmentEnv = process.env.NODE_ENV === 'development';

const _ = require('lodash');
const path = require('path');
const sql = require('mssql');

let getAsync, setAsync;
// Redis is only available on qa, staging, and production
const redis = require('redis');

// redis not present or useful for jest unit testing
if (process.env.NODE_ENV !== 'test') {
  const redisHost = process.env.REDIS_HOST || 'redis';
  const redisPort = process.env.REDIS_PORT || 6379;
  const client = redis.createClient({
    url: `redis://${redisHost}:${redisPort}`,
  });
  client.connect();
  const { promisify } = require('util');
  getAsync = promisify(client.get).bind(client);
  setAsync = promisify(client.set).bind(client);
}

const s3Utils = require(path.resolve('./config/privateutils/s3.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const lambdaUtils = require(path.resolve('./config/privateutils/lambda.utils'));
const analysisUtils = require(path.resolve('./config/privateutils/analysis.utils'));
const locationUtils = require(path.resolve('./config/privateutils/location.utils'));
const { getAnalysisDataForProtectedAreasByLocation } = require(path.resolve(
  './queries/system/getAnalysisDataForProtectedAreasByLocation'
));

/** @function {getAnalysisDataForUserList}
 *   @summary Function to return analysis data for a user list.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of the user list in the database
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getAnalysisDataForUserList = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'listID', type: sql.Int, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetAnalysisDataForUserList', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get user list analysis data',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {getAnalysisDataForGFWList}
 *   @summary Function to return analysis data for a GFW list.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of the GFW list in the database
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getAnalysisDataForGFWList = (req, list_id, location_ids = []) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.Int, value: list_id }];

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
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
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
const getAnalysisDataForProtectedAreas = (req, list_id, filters) => {
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
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
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
const getAnalysisDataForProtectedAreasByLocationId = (req, list_id, location_id) => {
  return new Promise((resolve, reject) => {
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
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get GFW list analysis data',
          err
        );
        reject(errorObject);
      });
  });
};

/** @function {getGFWListAnalyses}
 *   @summary Function to return GFW list analysis.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of list
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getGFWListAnalyses = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.INT, value: list_id }];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetListAnalysis', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        console.log('Error retrieving gfw list analysis', errorMessage);
        const message = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
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
const getAFIAnalysisForListId = (req, listId) => {
  return new Promise((resolve, reject) => {
    const queryParams = [{ field: 'listId', type: sql.Int, value: listId }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetAfiAnalysisForListId', queryParams)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((error) => {
        const errorMessage = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetAFIAnalysisForListId,
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
const getAFINegligibleStatsForListId = (req, listId) => {
  return new Promise((resolve, reject) => {
    const queryParams = [{ field: 'listId', type: sql.Int, value: listId }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetAfiNegligibleRiskStatsForListId', queryParams)
      .then((recordsets) => {
        resolve(recordsets[0]);
      })
      .catch((error) => {
        const errorMessage = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetAFINegligibleStatsForListId,
          `Failed to get afi negligible stats for list id = ${listId}`,
          error
        );
        reject(errorMessage);
      });
  });
};

/** @function {getListAnalyses}
 *   @summary Function to return list analysis.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {Number}  list_id - ID of list
 *   @return {Promise} Returns promise object. If successful, recordsets, otherwise, error object
 */
const getListAnalyses = (req, list_id) => {
  return new Promise((resolve, reject) => {
    const parameters = [{ field: 'list_id', type: sql.INT, value: list_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetListAnalysis', parameters)
      .then((recordsets) => {
        resolve(recordsets);
      })
      .catch((errorMessage) => {
        console.log('Error retrieving list analysis', errorMessage);
        const message = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetList,
          'Failed to get list analysis',
          errorMessage
        );
        reject(message);
      });
  });
};

/** @function {requestAnalysis}
 *   @summary Function to send SQS message to request analysis for later
 *   @param  {Object}    req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String}    list_name - Name of the list
 *   @param  {Object}    geojson - A geojson used for the analysis
 *   @param  {Boolean}   isEdit - A boolean used to determine if we are running a list edit (either a move or copy location)
 */
const requestAnalysis = async (req, list_name, geojson = {}, isEdit = false) => {
  // Required to request analysis
  const organization_database = req.session.organization_database;

  // Returns list
  const list = await ListManager.getListByListName(req, list_name);

  // Determine if we're request location or list analysis
  if (typeof geojson === 'object' && Object.keys(geojson).length === 0) {
    // Perform a list analysis
    analysisUtils.analyzeList(req, organization_database, list);
  } else if (
    typeof geojson === 'object' &&
    geojson.hasOwnProperty('type') &&
    geojson.type === 'FeatureCollection'
  ) {
    // Perform a location analysis
    analysisUtils.analyzeLocation(req, organization_database, list, geojson);
  } else {
    errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.failedToGetList,
      'Requesting unexpected analysis',
      ''
    );
  }
};

/**
 * @summary Returns a hash value from a string
 * @param {String} str String to be turned into a hash
 */
const createHashFromString = (str) => {
  let hash = 5381;
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0;
};

/** @function {requestDashboardAnalysis}
 *   @summary Invokes lambda to retrieve on-the-fly analysis results for Dashboard, returns cached data from Redis if it exists.
 *   @param  {Object}   request - Express request object
 *   @param  {Object}  list - Object containing target list properties
 *   @param  {Boolean}  isGFWList - Boolean to determine whether target list is a gfw list or organization list
 *   @return {Promise} Returns dashboard analysis results
 */
const requestDashboardAnalysis = async (request, list, isGFWList) => {
  try {
    let dashboardData;
    const { organization_database, organization_id, organization_user_id } = request.session;
    // Naming the key that will be stored in Redis
    const redisKey = createHashFromString(
      `${process.env.NODE_ENV}:${organization_database}:${organization_id}:${list.id}:${isGFWList}`
    );

    // Grabing any cached dashboard data
    if (!developmentEnv) {
      try {
        dashboardData = await getAsync(redisKey);
        // If we have any dashboard data, just return that
        if (dashboardData) {
          return JSON.parse(dashboardData);
        }
      } catch (error) {
        console.log('Could not fetch data from Redis.');
      }
    }
    // grab correct location s3 info for the desired list
    const { location_s3_info, geojson } = isGFWList
      ? await GFWListManager.getDashboardGFWListLocations(request, list.id)
      : await ListManager.getDashboardListLocations(request, list);
    // filter out geojson by gadm as analysis can only run on locations with gadm
    const { withGADM, withoutGADM } = locationUtils.filterGeojsonByGADM(geojson);
    // those without gadm are determined as failed
    const failedGeoJSON = withoutGADM;
    // create unique name to place our dashboard analysis geoojson (those with gadm)
    const name = `da-${list.list_table_name}-${organization_user_id}-${new Date().getTime()}`;

    // run the first batch of analysis on the dissolved locations
    // at the same time put the analysis geojson and retrieve dissolved locations from s3
    const firstBatch = await Promise.all([
      s3Utils.put(name, { geojson: withGADM }),
      s3Utils.get(location_s3_info.bucket, location_s3_info.key),
      lambdaUtils.invoke('dashboard-analysis', { location_s3_info, analysisType: 'GLAD' }),
      lambdaUtils.invoke('dashboard-analysis', { location_s3_info, analysisType: 'FIRE' }),
      lambdaUtils.invoke('dashboard-analysis', { location_s3_info, analysisType: 'EXTENT' }),
      lambdaUtils.invoke('dashboard-analysis', { location_s3_info, analysisType: 'GLAD_VALIDATE' }),
    ]);
    const [s3Info, dissolvedObject, ...dissolvedAnalyses] = firstBatch;
    // parse and push to array of dissolved analysis results
    const dissolvedS3Data = dissolvedAnalyses.map((analysis) => JSON.parse(analysis.Payload));

    // repeat the step above for locational dashboard analysis
    const secondBatch = await Promise.all([
      lambdaUtils.invoke('dashboard-analysis', { location_s3_info: s3Info, analysisType: 'GLAD' }),
      lambdaUtils.invoke('dashboard-analysis', { location_s3_info: s3Info, analysisType: 'FIRE' }),
      lambdaUtils.invoke('dashboard-analysis', {
        location_s3_info: s3Info,
        analysisType: 'EXTENT',
      }),
      lambdaUtils.invoke('dashboard-analysis', {
        location_s3_info: s3Info,
        analysisType: 'GLAD_VALIDATE',
      }),
    ]);
    const listS3Data = secondBatch.map((analysis) => JSON.parse(analysis.Payload));

    // retrieve the dashboard analysis data stored in s3
    const dissolvedDataPromise = dissolvedS3Data.map((obj) => s3Utils.get(obj.bucket, obj.key));
    const listDataPromise = listS3Data.map((obj) => s3Utils.get(obj.bucket, obj.key));
    const data = await Promise.all([
      Promise.all(dissolvedDataPromise),
      Promise.all(listDataPromise),
    ]);
    const [dissolvedData, listData] = data;
    // formulate the final dashboard analysis
    const dashboardAnalysis = await locationUtils.dashboardMerger(
      geojson,
      dissolvedObject.geojson,
      listData,
      dissolvedData
    );

    const dashboardResults = {
      geojson: dashboardAnalysis.geojson,
      dissolvedGeoJSON: dashboardAnalysis.dissolvedGeoJSON,
      failedGeoJSON,
    };

    // Caching the result in redis and letting it expire after 24 hours.
    if (
      !developmentEnv &&
      dashboardResults.geojson.features.length > 0 &&
      dashboardResults.dissolvedGeoJSON.features.length > 0
    ) {
      try {
        await setAsync(redisKey, JSON.stringify(dashboardResults), 'EX', 86400);
      } catch (error) {
        console.log('Could not save the dashboard analysis to Redis.');
      }
    }
    return dashboardResults;
  } catch (error) {
    console.log('Request Dashboard Analysis Error', error);
    throw new Error(error);
  }
};

const formatNumber = (data, decimals = 2) => {
  const isFloat = (n) => Number(n) === n && n % 1 !== 0;

  if (data === undefined || data === null) return data;

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

module.exports = {
  formatNumber,
  getAnalysisDataForUserList,
  getAnalysisDataForGFWList,
  getAnalysisDataForProtectedAreas,
  getAnalysisDataForProtectedAreasByLocationId,
  getGFWListAnalyses,
  getListAnalyses,
  requestAnalysis,
  requestDashboardAnalysis,
  getAFIAnalysisForListId,
  getAFINegligibleStatsForListId,
};

// Require after modules have been exported so the module can be fully loaded
const ListManager = require(path.resolve('./config/publicutils/listManager.utils'));
const GFWListManager = require(path.resolve('./config/publicutils/gfwListManager.utils'));
