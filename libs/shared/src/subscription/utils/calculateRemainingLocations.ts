import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

export function calculateRemainingLocations(
  accountLimits: Partial<AnalysisLimit>,
  accountUsage: OrganizationAnalysisUsage
) {
  const availableLocations = accountLimits.max_locations_per_year - accountUsage.locations_analyzed;

  return availableLocations;
}
