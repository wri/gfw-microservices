import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

export function calculateListProcessingLimit(
  accountLimits: AnalysisLimit,
  accountUsage: OrganizationAnalysisUsage
) {
  return accountLimits.MaxAreaAnalyzeablePerYear - accountUsage.total_area_analyzed;
}
