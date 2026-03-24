import { calculateAccountUsagePercentage, getAccountSubscriptionData } from '../utils';

export async function getAccountUsagePercentage({ organizationId, subscriptionStatusId }) {
  const { accountUsage, accountLimits } = await getAccountSubscriptionData({
    organizationId,
    subscriptionStatusId,
  });

  const areaUsagePercentage = calculateAccountUsagePercentage(
    accountUsage.total_area_analyzed,
    accountLimits.MaxAreaAnalyzeablePerYear
  );

  const locationUsagePercentage = calculateAccountUsagePercentage(
    accountUsage.locations_analyzed,
    accountLimits.max_locations_per_year
  );

  const tokenUsagePercentage = calculateAccountUsagePercentage(
    accountUsage.total_tokens ?? 0,
    accountLimits.tokens_per_year ?? 0
  );

  return Math.max(areaUsagePercentage, locationUsagePercentage, tokenUsagePercentage);
}
