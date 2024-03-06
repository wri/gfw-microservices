import { getListLocationsCountById } from '@wri-monorepos/sql';
import { getAccountSubscriptionData } from '../utils';

export interface CheckAccountListLocationProcessingLimit {
  listId: number;
  orgDbName: string;
  organizationId: number;
  subscriptionStatusId: number;
}
export async function getListLocationProcessingLimitCheck({
  listId,
  orgDbName,
  organizationId,
  subscriptionStatusId,
}) {
  const { accountUsage, accountLimits } = await getAccountSubscriptionData({
    organizationId,
    subscriptionStatusId,
  });

  const listLocationsCount = await getListLocationsCountById(listId, orgDbName);

  return (
    accountUsage.locations_analyzed + listLocationsCount > accountLimits.max_locations_per_year
  );
}
