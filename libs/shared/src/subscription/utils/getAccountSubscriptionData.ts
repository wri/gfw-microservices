import { getAccountAnalysisUsage, getAccountRenewalTime } from '@wri-monorepos/sql';
import { getAccountLimits } from '../limits';
import { calculateAccountSubscriptionDates } from './accountSubscriptionDates';

export async function getAccountSubscriptionData({
  organizationId,
  subscriptionStatusId,
}: {
  organizationId: number;
  subscriptionStatusId: number;
}) {
  const organizationRenewalTime = await getAccountRenewalTime(organizationId);
  const { startDate, endDate } = calculateAccountSubscriptionDates(organizationRenewalTime);

  const accountUsageOptions = {
    startDate,
    endDate,
    organizationId,
  };

  const [accountUsage] = await getAccountAnalysisUsage(accountUsageOptions);
  const accountLimits = await getAccountLimits(organizationId, subscriptionStatusId);

  return {
    accountUsage,
    accountLimits,
    organizationRenewalTime,
  };
}
