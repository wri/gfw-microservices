import { getAccountAnalysisLimits } from '@wri-monorepos/sql';

export async function getAccountLimits(organizationId: number, organizationType: number) {
  const organizationCustomLimits = await getAccountAnalysisLimits({ organizationId });
  const organizationSubscriptionLimits = await getAccountAnalysisLimits({ organizationType });

  return organizationCustomLimits || organizationSubscriptionLimits;
}
