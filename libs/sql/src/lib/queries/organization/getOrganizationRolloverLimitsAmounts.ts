/**
 * Gets the organization usage for the total area analyzed from lists, the total area analyzed from locations, and the total number of locations analyzed for each year, aggregating and summarizing data from the [ListsProcessing] table based on the year difference between organization activated time and analysis_end_time
 *
 * Requires the following parameters:
 * @param {Int} orgId
 */
export const getOrganizationRolloverLimitsAmounts = `
WITH YearlyAnalysis AS (
    SELECT
        DATEDIFF(YEAR, org.organization_activated_time, lp.analysis_start_time) AS years_since_activation,
        CASE 
            WHEN lp.area_analyzed_list_ha - al.MaxAreaAnalyzeablePerYear > 0 
            THEN lp.area_analyzed_list_ha - al.MaxAreaAnalyzeablePerYear
            ELSE 0
        END AS adjusted_area_list,
        CASE 
            WHEN lp.locations_analyzed - al.max_locations_per_year > 0 
            THEN lp.locations_analyzed - al.max_locations_per_year
            ELSE 0
        END AS adjusted_area_locations
    FROM
        [dbo].[ListsProcessing] lp
    INNER JOIN
        [gfwpro].[dbo].[AnalysisLimits] al ON al.OrgType = org.subscription_status_id
    INNER JOIN
        [gfwpro].[dbo].[UserRoutes] usr ON usr.id = lp.user_id
    INNER JOIN
        [gfwpro].[dbo].[Organizations] org ON org.id = usr.organization_id
    INNER JOIN
        [gfwpro].[dbo].[Statuses] st ON org.organization_status_id = st.id
    WHERE
        lp.analysis_start_time >= org.organization_activated_time
        AND st.status_name = 'Active'
        AND org.id = @orgId
)

SELECT
    years_since_activation AS years,
    SUM(adjusted_area_list) AS totalAreaAnalyzed,
    SUM(adjusted_area_locations) AS totalLocationsAnalyzed
FROM
    YearlyAnalysis
GROUP BY
    years_since_activation;
`;

export interface OrganizationRolloverLimitsAmount {
  years: number;
  totalAreaAnalyzed: number;
  maxAreaAnalyzed: number;
  totalLocationsAnalyzed: number;
}
