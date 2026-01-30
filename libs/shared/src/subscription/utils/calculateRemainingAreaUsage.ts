import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

export function calculateRemainingAreaUsage(
  accountLimits: AnalysisLimit,
  accountUsage: OrganizationAnalysisUsage
) {
  const availableAnalyzableArea =
    (accountLimits.MaxAreaAnalyzeablePerYear ?? 0) - accountUsage.total_area_analyzed;
  return availableAnalyzableArea;
}
