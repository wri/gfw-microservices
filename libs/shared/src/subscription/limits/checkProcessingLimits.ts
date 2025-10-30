import { checkLocationProcessingLimit } from './checkLocationProcessingLimit';
import { getListProcessingLimits } from './getListProcessingLimits';

interface CheckProcessingLimitsParameters {
  organizationDb: string;
  organizationId: number;
  subscriptionStatusId: number;
  listId: number;
  analysisTypesToProcess?: Record<string, boolean>;
}

/**
 * @summary Checks account locations limits and returns list processing area limits for step function. Throws error if isListLocationOverLimit
 * @param {Object} CheckProcessingLimitsParameters
 * @returns {Object} { isListLocationOverLimit: boolean, processingLimit: number }
 */
export async function checkProcessingLimits({
  organizationDb,
  organizationId,
  subscriptionStatusId,
  listId,
  analysisTypesToProcess = {},
}: CheckProcessingLimitsParameters) {
  const isListLocationOverLimit = await checkLocationProcessingLimit({
    listId,
    orgDbName: organizationDb,
    organizationId,
    subscriptionStatusId,
    analysisTypesToProcess,
  });

  const processingLimit = await getListProcessingLimits({
    organizationId,
    organizationType: subscriptionStatusId,
  });

  return {
    isListLocationOverLimit,
    processingLimit,
  };
}
