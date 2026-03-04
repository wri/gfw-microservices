import { getAccountSubscriptionData, calculateListProcessingLimit } from '../utils';

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

  // calculateListProcessingLimit handles tokenization internally
  return calculateListProcessingLimit({
    accountLimits,
    accountUsage,
    organizationId,
  });
}
