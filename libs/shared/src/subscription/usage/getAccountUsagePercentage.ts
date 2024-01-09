import { calculateAccountUsagePercentage, getAccountSubscriptionData } from '../utils';

export async function getAccountUsagePercentage({ organizationId, subscriptionStatusId }) {
  const { accountUsage, accountLimits } = await getAccountSubscriptionData({
    organizationId,
    subscriptionStatusId,
  });

  return calculateAccountUsagePercentage(
    accountUsage.total_area_analyzed,
    accountLimits.MaxAreaAnalyzeablePerYear
  );
}
