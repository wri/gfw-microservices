import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';
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
  const maxAreaAnalyzeablePerYear = accountLimits.MaxAreaAnalyzeablePerYear;

  const availableAnalyzableAreaRemaining =
    maxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
}
