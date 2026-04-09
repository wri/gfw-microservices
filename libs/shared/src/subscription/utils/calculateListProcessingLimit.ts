import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';
export interface CalculateListProcessingLimitParams {
  accountLimits: AnalysisLimit;
  accountUsage: OrganizationAnalysisUsage;
}

/**
 * Calculates the processing limit for a list based on account limits and usage.
 *
 * @param params - The parameters for calculating the list processing limit
 * @returns The maximum area that can be processed for this list
 */
export async function calculateListProcessingLimit({
  accountLimits,
  accountUsage,
}: CalculateListProcessingLimitParams): Promise<number> {
  const maxAreaAnalyzeablePerYear = accountLimits.MaxAreaAnalyzeablePerYear;

  const availableAnalyzableAreaRemaining =
    maxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
}
