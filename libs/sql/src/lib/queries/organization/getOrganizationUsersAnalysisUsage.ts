/**
 * Gets the analysis usage for organization users
 * The command requires the following parameters:
 * @startDate DATETIME,
 * @endDate DATETIME
 */
export const getOrganizationUsersAnalysisUsage = `
SELECT
  user_id,
  ISNULL(SUM(area_analyzed_list_ha), 0) as total_area_analyzed,
  ISNULL(MAX(area_analyzed_list_ha), 0) as max_area_analyzed,
  COUNT(DISTINCT list_id) as total_lists_analyzed,
  ISNULL(SUM(locations_analyzed), 0) as total_locations_analyzed
FROM
  [dbo].[ListsProcessing]
WHERE
  analysis_end_time >= @startDate
AND analysis_end_time <= @endDate
AND user_id IS NOT NULL
GROUP BY
  user_id;
`;

export interface OrganizationUsersAnalysisUsage {
  total_area_analyzed: number;
  max_area_analyzed: number;
  number_of_lists_analyzed: number;
  locations_analyzed: number;
  user_id: number;
}
