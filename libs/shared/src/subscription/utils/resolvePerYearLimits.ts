import { AnalysisLimit } from '@wri-monorepos/sql';
import { addYears, isBefore } from 'date-fns';

/**
 * Maps raw AnalysisLimits rows (with full update_time dates) to contract year periods
 * based on the organization's renewal date.
 *
 * For each contract year (renewal, renewal+1yr, renewal+2yr, ..., up to now),
 * finds the newest limit row where update_time <= that contract year's start date.
 *
 * @param rawLimits - Raw limit rows ordered by update_time ASC
 * @param renewalDate - The org's renewal/contract start date
 * @returns Array of AnalysisLimit with year field (0-based years since renewal)
 */
export function resolvePerYearLimits(
  rawLimits: AnalysisLimit[],
  renewalDate: Date
): AnalysisLimit[] {
  if (rawLimits.length === 0) {
    return [];
  }

  const now = new Date();
  const result: AnalysisLimit[] = [];

  let year = 0;
  let periodStart = renewalDate;

  while (isBefore(periodStart, now) || year === 0) {
    // Find the newest limit where update_time <= periodStart
    let applicableLimit: AnalysisLimit | null = null;
    for (const limit of rawLimits) {
      const limitDate = new Date(limit.update_time);
      if (isBefore(limitDate, periodStart) || limitDate.getTime() === periodStart.getTime()) {
        applicableLimit = limit;
      }
    }

    // If no limit found for this period (e.g. renewal is before any limit was created),
    // use the earliest available limit
    if (!applicableLimit) {
      applicableLimit = rawLimits[0];
    }

    result.push({
      MaxAreaAnalyzeablePerYear: applicableLimit.MaxAreaAnalyzeablePerYear,
      MaxAreaPerList: applicableLimit.MaxAreaPerList,
      OrgType: applicableLimit.OrgType,
      max_locations_per_year: applicableLimit.max_locations_per_year,
      tokens_per_year: applicableLimit.tokens_per_year,
      year,
    });

    year++;
    periodStart = addYears(renewalDate, year);
  }

  return result;
}
