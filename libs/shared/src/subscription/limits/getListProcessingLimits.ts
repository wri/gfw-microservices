import { getAccountSubscriptionData, calculateListProcessingLimit } from '../utils';
import {} from '../utils';

interface GetAccountProcessingLimitFn {
  organizationId: number;
  organizationType: number /* subscription_status_id */;
}

export async function getListProcessingLimits({
  organizationId,
  organizationType,
}: GetAccountProcessingLimitFn) {
  const { accountUsage, accountLimits } = await getAccountSubscriptionData({
    organizationId,
    subscriptionStatusId: organizationType,
  });

  // Calculate Processing limit either left for the year or max limit per list
  return calculateListProcessingLimit(accountLimits, accountUsage);
}
