
import * as AWSSES from '../../../config/privateutils/ses.utils';

import { checkProcessingLimits } from '@wri-monorepos/shared';
import { updateListsAnalysisStatus } from '@wri-monorepos/sql';
import {
  extractAnalysisTypes,
  getListAnalysisStatus,
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

  const result = await handleCreateAnalysis(
    analysisTypesToProcess,
    listID,
    organizationId,
    databaseName,
    user_email,
    organization_user_id,
    subscriptionStatusId,
    reanalyze
  );

  const listAnalysisStatusData = await getListAnalysisStatusByListId(databaseName, listID);

  const analysiTypes = extractAnalysisTypes(
    analysisTypesToProcess
      ? listAnalysisStatusData.filter(({ analysisId }) =>
          analysisTypesToProcess.includes(analysisId)
        )
      : listAnalysisStatusData
  );

  // Send email to user that list is submitted to be analysed
  await AWSSES.sendEmail__ListSubmittedForAnalysis(req, list_name, analysiTypes);

  return result;
};
