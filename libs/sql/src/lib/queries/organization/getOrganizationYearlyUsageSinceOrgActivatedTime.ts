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
        AND lp.user_id IS NOT NULL
) AS YearlyAnalysis
    GROUP BY years_since_activation
`;

export interface OrganizationYearlyUsageSinceOrgActivation {
  years_since_activation: number;
  totalAreaPerLocationsAnalyzedYearly: number;
  totalLocationsYearly: number;
}
