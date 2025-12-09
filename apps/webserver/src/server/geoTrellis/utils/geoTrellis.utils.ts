import * as AWSSES from '../../../config/privateutils/ses.utils';
import * as logger from '../../../config/privateutils/logger.utils';

import {
  extractAnalysisTypes,
  handleCreateAnalysis,
  getListAnalysisStatusByListId,
} from '@wri-monorepos/geo';

/**
 * Submitting Analyze List request to step function for list to be processed by GeoTrellis
 *
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {Object} list - List info
 * @return {Promise} - request Promise
 */
// ...existing code...

export const handleGeoTrellisAnalyzeListRequest = async (req, list, analysisTypesToProcess) => {
  const {
    organization_user_id,
    organization_id: organizationId,
    organization_database: databaseName,
    subscription_status_id: subscriptionStatusId,
  } = req.session;

  const { reanalyze = false } = req.body;
  const { id: listID, list_name } = list;
  const { user_email } = req.session;

  const listAnalysisStatusData = await getListAnalysisStatusByListId(databaseName, listID);

  // NEW: Extract base analysis IDs (remove option suffixes like _Weekly)
  const analysisIds = listAnalysisStatusData?.map(({ analysisId }) => analysisId) ?? [];

  // NEW: Check if ALERTS has Weekly option from request
  const hasAlertsWeekly =
    analysisTypesToProcess?.includes('ALERTS') || req.body.analysisTypesParam?.ALERTS_Weekly;

  try {
    // Pass analysisIds with options handled
    const processedAnalysisTypes = analysisTypesToProcess
      ? analysisTypesToProcess.split(',').filter((id) => !id.includes('_')) // Remove option suffixes
      : analysisIds;

    const result = await handleCreateAnalysis(
      processedAnalysisTypes.join(','),
      listID,
      organizationId,
      databaseName,
      user_email ? true : false,
      organization_user_id,
      subscriptionStatusId,
      reanalyze
    );

    const analysiTypes = extractAnalysisTypes(
      processedAnalysisTypes
        ? listAnalysisStatusData.filter(({ analysisId }) =>
            processedAnalysisTypes.includes(analysisId)
          )
        : listAnalysisStatusData
    );

    // Send email to user that list is submitted to be analysed
    await AWSSES.sendEmail__ListSubmittedForAnalysis(req, list_name, analysiTypes);

    return result;
  } catch (error) {
    logger.logActivity(
      req,
      logger.listActivityTypes.List.ListAnalyzing,
      `Error sending ${list_name} to analysis: ${error.stack || error}`
    );
    throw error;
  }
};
