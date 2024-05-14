const path = require('path');
import axios from 'axios';

const logger = require(path.resolve('./config/privateutils/logger.utils'));
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));

const {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
} = require('../config/geoTrellis.config');

import { checkProcessingLimits } from '@wri-monorepos/shared';
import { extractAnalysisTypes, getListAnalysisStatus } from '@wri-monorepos/geo';
import { updateListsAnalysisStatus } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';

/**
 * Submitting Analyze List request to step function for list to be processed by GeoTrellis
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} list - List info
 * @return {Promise} - request Promise
 */
export const handleGeoTrellisAnalyzeListRequest = async (req, list, analysisTypesToProcess) => {
  const {
    organization_user_id,
    organization_id: organizationId,
    organization_database: databaseName,
    subscription_status_id: subscriptionStatusId,
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

  const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
    organizationDb: databaseName,
    organizationId,
    subscriptionStatusId,
    listId: listID,
  });

  const listAnalysisStatusData = await getListAnalysisStatus(databaseName, listID);
  console.log("• ~ listAnalysisStatusData:", listAnalysisStatusData)
  console.log("• ~ analysisTypesToProcess:", analysisTypesToProcess)
  
  const analysiTypes = extractAnalysisTypes(
    analysisTypesToProcess
    ? listAnalysisStatusData.filter(({ analysisId }) =>
      analysisTypesToProcess.includes(analysisId)
  )
  : listAnalysisStatusData
);
console.log("• ~ analysiTypes:", analysiTypes)

  if (isListLocationOverLimit) {
    await updateListsAnalysisStatus(databaseName, {
      listId: listID,
      errorInfo: 'Exceeded Analysis Limit',
      status: listStatus.Inactive,
    });
    throw new Error(`Analysis limit reached`);
  }

  const data = {
    list_id: listID,
    user_id: organization_user_id,
    organization_id: parseInt(organizationId),
    reanalyze,
    processing_limit: processingLimit,
    analysis_types: analysiTypes,
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
      await AWSSES.sendEmail__ListSubmittedForAnalysis(req, list_name, analysiTypes);

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
