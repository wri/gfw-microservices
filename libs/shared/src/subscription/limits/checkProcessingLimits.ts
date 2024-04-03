import { getListLocationProcessingLimitCheck } from './getListLocationProcessingLimitCheck';
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
  try {
    const isListLocationOverLimit = await getListLocationProcessingLimitCheck({
      listId,
      orgDbName: organizationDb,
      organizationId,
      subscriptionStatusId,
    });

    if (isListLocationOverLimit) {
      throw new Error('ProcessingLimitException');
    }

    const processingLimit = await getListProcessingLimits({
      organizationId,
      organizationType: subscriptionStatusId,
    });

    return processingLimit;
  } catch (error) {
    if (error.message === 'ProcessingLimitException') {
      return error;
    }
    throw new Error(error);
  }
}
