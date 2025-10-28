import { getListLocationsCountById } from '@wri-monorepos/sql';
import { getAccountSubscriptionData } from '../utils';

// Local constant to avoid cross-package import issues
const GREENHOUSE_GAS_EMISSIONS = 'GHG';

export interface CheckAccountListLocationProcessingLimit {
  listId: number;
  orgDbName: string;
  organizationId: number;
  subscriptionStatusId: number;
  analysisTypesToProcess?: Record<string, boolean>;
}

export async function checkLocationProcessingLimit({
  listId,
  orgDbName,
  organizationId,
  subscriptionStatusId,
  analysisTypesToProcess = {},
}: CheckAccountListLocationProcessingLimit) {
  // If only GHG analysis is being processed, skip location count check
  const onlyGHG = Object.entries(analysisTypesToProcess).every(([key, value]) =>
    key === GREENHOUSE_GAS_EMISSIONS ? value : !value
  );

  if (onlyGHG) {
    return false; // Don't block GHG-only analysis based on location limits
  }

  const { accountUsage, accountLimits } = await getAccountSubscriptionData({
    organizationId,
    subscriptionStatusId,
  });

  const listLocationsCount = await getListLocationsCountById(listId, orgDbName);

  return (
    accountUsage.locations_analyzed + listLocationsCount > accountLimits.max_locations_per_year
  );
}
