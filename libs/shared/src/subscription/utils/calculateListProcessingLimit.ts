import { AnalysisLimit, OrganizationAnalysisUsage, getHALimitForCurrentYear } from '@wri-monorepos/sql';
import { featureFlagsService } from '../../lib/utils/feature.flag.service';

const TOKENIZATION_FLAG_ID = 'Tokenization';

/**
 * Checks if tokenization feature flag is enabled for the given organization
 */
async function isTokenizationEnabled(organizationId: number): Promise<boolean> {
  try {
    const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
    const flags = await getFeatureFlagsForCurrentOrg(organizationId);
    return flags.some((flag) => flag.flagId === TOKENIZATION_FLAG_ID && flag.flagState === true);
  } catch (error) {
    // If feature flag lookup fails, fall back to disabled to avoid blocking processing unexpectedly
    return false;
  }
}

export interface CalculateListProcessingLimitParams {
  accountLimits: AnalysisLimit;
  accountUsage: OrganizationAnalysisUsage;
  organizationId: number;
}

/**
 * Calculates the processing limit for a list based on account limits and usage.
 *
 * When tokenization feature flag is enabled:
 * - Uses the per-year HA limit (based on AnalysisLimits.update_time in current year)
 *   instead of the standard MaxAreaAnalyzeablePerYear.
 *
 * When tokenization is disabled:
 * - Uses the standard MaxAreaAnalyzeablePerYear from account limits.
 *
 * @param params - The parameters for calculating the list processing limit
 * @returns The maximum area that can be processed for this list
 */
export async function calculateListProcessingLimit({
  accountLimits,
  accountUsage,
  organizationId,
}: CalculateListProcessingLimitParams): Promise<number> {
  let maxAreaAnalyzeablePerYear = accountLimits.MaxAreaAnalyzeablePerYear;

  // Check if tokenization is enabled for this organization
  const tokenizationEnabled = await isTokenizationEnabled(organizationId);

  if (tokenizationEnabled) {
    // When tokenization is enabled, use the per-year HA limit based on update_time
    maxAreaAnalyzeablePerYear = await getHALimitForCurrentYear(organizationId);
  }

  const availableAnalyzableAreaRemaining =
    maxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
}
