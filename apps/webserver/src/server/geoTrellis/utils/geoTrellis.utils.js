const path = require('path');
const axios = require('axios');

const logger = require(path.resolve('./config/privateutils/logger.utils'));
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));

const {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
} = require('../config/geoTrellis.config');

/**
 * Submitting Analyze List request to step function for list to be processed by GeoTrellis
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} list - List info
 * @return {Promise} - request Promise
 */
exports.handleGeoTrellisAnalyzeListRequest = async (req, list) => {
  const { organization_user_id, organization_id } = req.session;
  const { reanalyze = false } = req.body;

  const { id: listID, list_name } = list;

  let url;
  switch (process.env.NODE_ENV) {
    case 'qa':
      url = GEO_TRELLIS__ANALYZE_LIST_QA;
      break;
    case 'staging':
      url = GEO_TRELLIS__ANALYZE_LIST_STAGING;
      break;
    case 'production':
      url = GEO_TRELLIS__ANALYZE_LIST_PROD;
      break;
    case 'ProdV2':
      url = GEO_TRELLIS__ANALYZE_LIST_PRODV2;
      break;
    default:
      url = GEO_TRELLIS__ANALYZE_LIST_DEV;
  }

  const data = {
    list_id: listID,
    user_id: organization_user_id,
    organization_id: parseInt(organization_id),
    reanalyze: reanalyze,
  };

  return await axios({
    method: 'post',
    url: url,
    data: data,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (result) => {
      logger.logActivity(
        req,
        logger.listActivityTypes.List.ListAnalyzing,
        `ListAnalyzing ${list_name} has been sent to analysis`
      );

      // Send email to user that list is submitted to be analysed
      await AWSSES.sendEmail__ListSubmittedForAnalysis(req, list_name);

      return result;
    })
    .catch((error) => {
      logger.logActivity(
        req,
        logger.listActivityTypes.List.ListAnalyzing,
        `Error sending ${list_name} to analysis: ${error}`
      );

      return error.toJSON();
    });
};
