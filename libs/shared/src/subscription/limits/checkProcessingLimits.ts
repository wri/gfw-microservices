import { checkLocationProcessingLimit } from './checkLocationProcessingLimit';
import { getListProcessingLimits } from './getListProcessingLimits';

interface CheckProcessingLimitsParameters {
  organizationDb: string;
  organizationId: number;
  subscriptionStatusId: number;
  listId: number;
}
/**
 * @summary Checks account locations limits and returns list processing area limits for step function. Throws error if isListLocationOverLimit
 * @param {Object} CheckProcessingLimitsParameters
 * @returns {Number} processingLimit
 */
export async function checkProcessingLimits({
  organizationDb,
  organizationId,
  subscriptionStatusId,
  listId,
}: CheckProcessingLimitsParameters) {
  const isListLocationOverLimit = await checkLocationProcessingLimit({
    listId,
    orgDbName: organizationDb,
    organizationId,
    subscriptionStatusId,
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
