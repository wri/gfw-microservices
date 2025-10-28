import { getListLocationsCountById } from '@wri-monorepos/sql';
import { getAccountSubscriptionData } from '../utils';

// Note: 'GHG' is the analysis type for greenhouse gas emissions.
// The canonical definition exists in 'libs/shared/src/constants/analysisTypes.ts' as GREENHOUSE_GAS_EMISSIONS.
// This constant is duplicated here to avoid cross-package import issues (e.g., circular dependencies or build constraints).
// If possible, consider refactoring to use a shared constants module to avoid duplication.
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
