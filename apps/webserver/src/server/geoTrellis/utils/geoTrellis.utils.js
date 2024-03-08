const path = require('path');
const axios = require('axios');

const logger = require(path.resolve('./config/privateutils/logger.utils'));
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));

import { getListLocationsCountById } from '@wri-monorepos/sql';

const {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
} = require('../config/geoTrellis.config');

const { getListAnalysisStatusByListId } = require(path.resolve(
  './server/analytics/service/analytics.service'
));

import {
  getListProcessingLimits,
  getListLocationProcessingLimitCheck,
} from '@wri-monorepos/shared';

const extractAnalysisTypes = require(path.resolve('./server/analytics/utils/extractAnalysisTypes'));

/**
 * Submitting Analyze List request to step function for list to be processed by GeoTrellis
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} list - List info
 * @return {Promise} - request Promise
 */
exports.handleGeoTrellisAnalyzeListRequest = async (req, list) => {
  const {
    organization_user_id,
    organization_id,
    organization_database: databaseName,
    subscription_status_id,
  } = req.session;

  const { reanalyze = false } = req.body;
  const { id: listID, list_name } = list;

  const geoTrellisUrlsByEnv = {
    qa: GEO_TRELLIS__ANALYZE_LIST_QA,
    staging: GEO_TRELLIS__ANALYZE_LIST_STAGING,
    production: GEO_TRELLIS__ANALYZE_LIST_PROD,
    ProdV2: GEO_TRELLIS__ANALYZE_LIST_PRODV2,
    default: GEO_TRELLIS__ANALYZE_LIST_DEV,
  };

  const url = geoTrellisUrlsByEnv[process.env.NODE_ENV] || geoTrellisUrlsByEnv.default;

  const isListLocationOverLimit = await getListLocationProcessingLimitCheck({
    listId: listID,
    orgDbName: databaseName,
    organizationId: organization_id,
    subscriptionStatusId: subscription_status_id,
  });

  if (isListLocationOverLimit) {
    throw new Error('Analysis limit reached');
  }

  // calculate list processing limit
  const processingLimit = await getListProcessingLimits({
    organizationId: organization_id,
    organizationType: subscription_status_id,
  });

  const listAnalysisStatusData = await getListAnalysisStatusByListId(req, listID);
  const analysisTypes = extractAnalysisTypes(listAnalysisStatusData);

  const data = {
    list_id: listID,
    user_id: organization_user_id,
    organization_id: parseInt(organization_id),
    reanalyze,
    processing_limit: processingLimit,
    analysis_types: analysisTypes,
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
      await AWSSES.sendEmail__ListSubmittedForAnalysis(req, list_name, analysisTypes);

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
