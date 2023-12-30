import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

export function calculateProcessingLimit(
  accountLimits: AnalysisLimit,
  accountUsage: OrganizationAnalysisUsage
) {
  const availableAnalyzableAreaRemaining =
    accountLimits.MaxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;

  return Math.min(availableAnalyzableAreaRemaining, accountLimits.MaxAreaPerList);
}
