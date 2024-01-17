import {
  getAccountSubscriptionData,
  calculateRemainingAreaUsage,
  calculateRemainingLocations,
} from '../utils';

export async function getAccountRemainingUsage({ organizationId, subscriptionStatusId }) {
  const { accountUsage, accountLimits } = await getAccountSubscriptionData({
    organizationId,
    subscriptionStatusId,
  });

  return {
    remainingAvailableArea: calculateRemainingAreaUsage(accountLimits, accountUsage),
    remainingLocations: calculateRemainingLocations(accountLimits, accountUsage),
  };
}
