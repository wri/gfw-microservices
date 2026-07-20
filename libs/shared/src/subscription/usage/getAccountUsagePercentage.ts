import { getAccountAnalysisUsageByAnalysisType } from '@wri-monorepos/sql';
import {
  calculateAccountUsagePercentage,
  getAccountSubscriptionData,
  calculateAccountSubscriptionDates,
} from '../utils';

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getAccountUsagePercentage({
  organizationId,
  subscriptionStatusId,
  organizationDatabase,
}: {
  organizationId: number;
  subscriptionStatusId: number;
  organizationDatabase?: string;
}) {
  const { accountUsage, accountLimits, organizationRenewalTime } = await getAccountSubscriptionData(
    {
      organizationId,
      subscriptionStatusId,
    }
  );

  const areaUsagePercentage = calculateAccountUsagePercentage(
    accountUsage.total_area_analyzed,
    accountLimits.MaxAreaAnalyzeablePerYear
  );

  const locationUsagePercentage = calculateAccountUsagePercentage(
    accountUsage.locations_analyzed,
    accountLimits.max_locations_per_year
  );

  let tokenUsagePercentage = 0;
  const tokensPerYear = toNumber(accountLimits.tokens_per_year);

  if (organizationDatabase) {
    const { startDate, endDate } = calculateAccountSubscriptionDates(organizationRenewalTime);
    const usageByType = await getAccountAnalysisUsageByAnalysisType({
      startDate,
      endDate,
      orgDbName: organizationDatabase,
    });
    const totalTokensUsed = usageByType.reduce(
      (sum, usage) => sum + toNumber(usage.total_tokens),
      0
    );
    tokenUsagePercentage = calculateAccountUsagePercentage(totalTokensUsed, tokensPerYear);
  }

  return Math.max(areaUsagePercentage, locationUsagePercentage, tokenUsagePercentage);
}
