/**
 * Gets the organization usage for the total area analyzed from lists, the total area analyzed from locations, and the total number of locations analyzed for each year, aggregating and summarizing data from the [ListsProcessing] table based on the year difference between organization activated time and analysis_end_time
 *
 * Requires the following parameters:
 * @param {NVARCHAR} orgActivatedTime
 */
export const getOrganizationYearlyUsageSinceOrgActivatedTime = `
SELECT
    years_since_activation,
    ISNULL(SUM(area_analyzed_locations_ha),0) as totalAreaPerLocationsAnalyzedYearly,
    ISNULL(SUM(locations_analyzed),0) AS totalLocationsYearly
FROM (
    SELECT
        FLOOR(DATEDIFF(day, @orgActivatedTime, lp.analysis_end_time)/365.25) AS years_since_activation,
        lp.area_analyzed_locations_ha,
        lp.locations_analyzed
    FROM
        [dbo].[ListsProcessing] lp
    WHERE
        lp.analysis_end_time >= @orgActivatedTime
) AS YearlyAnalysis
    GROUP BY years_since_activation
`;

/**
 * Same as getOrganizationYearlyUsageSinceOrgActivatedTime but includes token usage
 * calculated via a cross-database join with ChargeRate.
 *
 * SQL parameter: orgActivatedTime (NVARCHAR)
 * @param systemDbName - injected at runtime (e.g. 'gfwpro')
 */
export function getOrganizationYearlyUsageWithTokens(systemDbName: string) {
  return `
SELECT
    years_since_activation,
    ISNULL(SUM(area_analyzed_locations_ha), 0) AS totalAreaPerLocationsAnalyzedYearly,
    ISNULL(SUM(locations_analyzed), 0) AS totalLocationsYearly,
    ISNULL(SUM(total_tokens), 0) AS totalTokensYearly
FROM (
    SELECT
        FLOOR(DATEDIFF(day, @orgActivatedTime, lp.analysis_end_time) / 365.25) AS years_since_activation,
        lp.area_analyzed_locations_ha,
        lp.locations_analyzed,
        (ISNULL(lp.locations_analyzed, 0) * ISNULL(cr.location_rate, 0)) + ISNULL(cr.list_rate, 0) AS total_tokens
    FROM
        [dbo].[ListsProcessing] lp
    LEFT JOIN [${systemDbName}].[dbo].[ChargeRate] cr ON
        lp.analysis_type = cr.analysis_type
        AND cr.effective_date = (
            SELECT MAX(cr2.effective_date)
            FROM [${systemDbName}].[dbo].[ChargeRate] cr2
            WHERE cr2.analysis_type = lp.analysis_type
            AND cr2.effective_date <= lp.analysis_end_time
        )
    WHERE
        lp.analysis_end_time >= @orgActivatedTime
        AND (lp.analysis_type <> 'ALERTS-BATCH' OR lp.analysis_end_time >= '2026-04-18')
) AS YearlyAnalysis
GROUP BY years_since_activation
`;
}

export interface OrganizationYearlyUsageSinceOrgActivation {
  years_since_activation: number;
  totalAreaPerLocationsAnalyzedYearly: number;
  totalLocationsYearly: number;
  totalTokensYearly?: number;
}
