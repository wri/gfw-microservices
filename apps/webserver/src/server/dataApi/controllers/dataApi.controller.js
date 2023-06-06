/* eslint-disable object-shorthand */
/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
const axios = require('axios');
const path = require('path');
const getPresignedUrl = require('../utils/dataApi.utils');

const logger = require(path.resolve('./config/lib/winston'));

const {
  GFW_API_URL__DATASET,
  GFW_API_URL__GFW_GEOSTORE,
  GFW_API_URL__GFW_METADATA,
  GFW_API_URL__PRO_CONFIG,
} = require('../config/dataApi.config');

const HEADERS_API_KEY = {
  'x-api-key': process.env.GFW_DATA_API_KEY,
};

/**
 * @description - Get the data from the GFW API for the given info Bubble ID
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getInfoBubbleDataController = (req, res) => {
  const { infoBubbleId } = req.params;
  logger.info(`/dataApi/getInfoBubbleData/ - Request => PARAMS: ${JSON.stringify(req.params)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__PRO_CONFIG}/${infoBubbleId}`,
    headers: HEADERS_API_KEY,
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: 200,
      };

      logger.info('/dataApi/getInfoBubbleData/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const responseError = {
        errors: [
          {
            detail: error.message,
            status: 404,
          },
        ],
      };

      logger.error(
        `/dataApi/getInfoBubbleData/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(404).json(responseError);
    });
};

/**
 * @description - Get Metadata Task Data
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getMetadataTaskData = (req, res) => {
  const { metadataID } = req.params;
  logger.info(`/dataApi/getMetadataTaskData/ - Request => PARAMS: ${JSON.stringify(req.params)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__GFW_METADATA}/${metadataID}`,
    headers: HEADERS_API_KEY,
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data,
        status: 200,
      };

      logger.info('/dataApi/getMetadataTaskData/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const responseError = {
        errors: [
          {
            detail: error.message,
            status: 404,
          },
        ],
      };

      logger.error(
        `/dataApi/getMetadataTaskData/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(404).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given GLAD
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getAnalysisGLAD = (req, res) => {
  const { geostore_origin = 'rw', geostoreID, group_by, start_date, end_date } = req.query;
  logger.info(`/dataApi/getAnalysisGLAD/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/umd_glad_landsat_alerts/latest/query`,
    headers: HEADERS_API_KEY,
    params: {
      geostore_origin: geostore_origin,
      geostore_id: geostoreID,
      sql: `SELECT COUNT(*) FROM data WHERE umd_glad_landsat_alerts__date >= '${start_date}' AND umd_glad_landsat_alerts__date <= '${end_date}' GROUP BY isoweek(${group_by})`,
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/getAnalysisGLAD/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(`/dataApi/getAnalysisGLAD/ - Request Error => ${JSON.stringify(responseError)}`);
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given VIIRS
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getAnalysisVIIRS = (req, res) => {
  const { geostore_origin = 'rw', geostoreID, fireDayStart } = req.query;
  logger.info(`/dataApi/getAnalysisVIIRS/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/nasa_viirs_fire_alerts/latest/query/json`,
    headers: HEADERS_API_KEY,
    params: {
      geostore_origin: geostore_origin,
      geostore_id: geostoreID,
      sql: `SELECT alert__date, sum(alert__count) AS alert__count FROM data WHERE alert__date >= '${fireDayStart}' GROUP BY alert__date`,
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/getAnalysisVIIRS/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/getAnalysisVIIRS/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given PRODES
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getAnalysisPRODES = (req, res) => {
  const { geostore_origin = 'rw', geostoreID, startYear, endYear } = req.query;
  logger.info(`/dataApi/getAnalysisPRODES/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/inpe_prodes/latest/query/json`,
    headers: HEADERS_API_KEY,
    params: {
      geostore_origin: geostore_origin,
      geostore_id: geostoreID,
      sql: `SELECT year, sum(gfw_area__ha) AS alert__count FROM data WHERE year >= ${startYear} AND year <= ${endYear} GROUP BY year`,
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/getAnalysisPRODES/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/getAnalysisPRODES/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given TREE COVER Loss
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.analysisTreeCoverLoss = (req, res) => {
  const {
    geostore_origin = 'rw',
    geostoreID,
    sum,
    startYear,
    endYear,
    filter,
    filter_value,
  } = req.query;
  logger.info(`/dataApi/analysisTreeCoverLoss/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/umd_tree_cover_loss/latest/query/json`,
    headers: HEADERS_API_KEY,
    params: {
      geostore_origin: geostore_origin,
      geostore_id: geostoreID,
      sql:
        `SELECT umd_tree_cover_loss__year, sum(${sum}) FROM data ` +
        `WHERE umd_tree_cover_loss__year >= ${startYear} AND umd_tree_cover_loss__year <= ${endYear} AND ${filter} >= ${filter_value} ` +
        'GROUP BY umd_tree_cover_loss__year',
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/analysisTreeCoverLoss/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/analysisTreeCoverLoss/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given TREE COVER Gain
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.analysisTreeCoverGain = (req, res) => {
  const { geostore_origin = 'rw', geostoreID, sum } = req.query;
  logger.info(`/dataApi/analysisTreeCoverGain/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/umd_tree_cover_gain/latest/query/json`,
    headers: HEADERS_API_KEY,
    params: {
      geostore_origin: geostore_origin,
      geostore_id: geostoreID,
      sql: `SELECT sum(${sum}) FROM data`,
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/analysisTreeCoverGain/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/analysisTreeCoverGain/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given TREE BIOMASS - Loss
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.analysisTreeBiomassLoss = (req, res) => {
  const {
    geostore_origin = 'rw',
    geostoreID,
    sum,
    startYear,
    endYear,
    filter,
    filter_value,
  } = req.query;
  logger.info(`/dataApi/analysisTreeBiomassLoss/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/umd_tree_cover_loss/latest/query/json`,
    headers: HEADERS_API_KEY,
    params: {
      geostore_origin: geostore_origin,
      geostore_id: geostoreID,
      sql:
        `SELECT umd_tree_cover_loss__year, sum(${sum}) FROM data ` +
        `WHERE umd_tree_cover_loss__year >= ${startYear} AND umd_tree_cover_loss__year <= ${endYear} AND ${filter} >= ${filter_value} ` +
        'GROUP BY umd_tree_cover_loss__year',
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/analysisTreeBiomassLoss/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/analysisTreeBiomassLoss/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given TREE BIOMASS - TOTAL
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.analysisTreeBiomassTotal = (req, res) => {
  const { geostore_origin = 'rw', geostoreID, sum } = req.query;
  logger.info(
    `/dataApi/analysisTreeBiomassTotal/ - Request => QUERY: ${JSON.stringify(req.query)}`
  );

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/whrc_aboveground_biomass_stock_2000/latest/query`,
    headers: HEADERS_API_KEY,
    params: {
      geostore_origin: geostore_origin,
      geostore_id: geostoreID,
      sql: `SELECT sum(${sum}) FROM data`,
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/analysisTreeBiomassTotal/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/analysisTreeBiomassTotal/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get the data from the GFW API for the given Admin/Region
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.analysisAdminRegion = (req, res) => {
  const { admin, region = '', thresh } = req.query;
  logger.info(`/dataApi/analysisAdminRegion/ - Request => PARAMS: ${JSON.stringify(req.params)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__GFW_GEOSTORE}/admin/${admin}/${region}?thresh=${thresh}`,
    headers: HEADERS_API_KEY,
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/analysisAdminRegion/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/analysisAdminRegion/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * @description - Get Palm Oil Mill Lat/Long
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getPalmOilMillLatLong = (req, res) => {
  const { PalmOilMillID } = req.query;
  logger.info(`/dataApi/getPalmOilMillLatLong/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/gfw_universal_mill_list/latest/query`,
    headers: HEADERS_API_KEY,
    params: {
      sql: `select latitude, longitude from data where uml_id in ('${PalmOilMillID}')`,
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/getPalmOilMillLatLong/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/getPalmOilMillLatLong/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * Get BBox and Geostore IDs using SQL query
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getBBoxAndGeostoreIDs = (req, res) => {
  const { GFW_LIST, QUERY_FIELD, IDs, date } = req.query;
  logger.info(`/dataApi/getBBoxAndGeostoreIDs/ - Request => QUERY: ${JSON.stringify(req.query)}`);

  const formattedIDs = `'${IDs.split(',').join("','")}'`;

  const config = {
    method: 'get',
    url: `${GFW_API_URL__DATASET}/${GFW_LIST}/${date}/query`,
    headers: HEADERS_API_KEY,
    params: {
      sql: `select gfw_geostore_id, gfw_bbox from data where ${QUERY_FIELD} in (${formattedIDs})`,
    },
  };

  axios(config)
    .then((response) => {
      const responseSuccess = {
        data: response.data.data,
        status: response.status,
      };

      logger.info('/dataApi/getBBoxAndGeostoreIDs/ - Request Success');
      res.status(200).json(responseSuccess);
    })
    .catch((error) => {
      const errorStatus = error?.response?.status || 422;
      const responseError = {
        errors: [
          {
            detail: error?.message,
            status: errorStatus,
          },
        ],
      };

      logger.error(
        `/dataApi/getBBoxAndGeostoreIDs/ - Request Error => ${JSON.stringify(responseError)}`
      );
      res.status(errorStatus).json(responseError);
    });
};

/**
 * Get pre-signed URL for S3 object
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @return {Promise} - request Promise
 */
exports.getPreSignedUrlForLargeProccessingList = (req, res) => {
  const { fileName, fileType } = req.body;
  const presignedURL = getPresignedUrl(fileName, fileType);
  return res.status(200).json({ presignedURL });
};
