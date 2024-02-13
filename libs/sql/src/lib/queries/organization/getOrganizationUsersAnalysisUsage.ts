/**
 * Gets the analysis usage for organization users
 * The command requires the following parameters:
 * @startDate DATETIME,
 * @endDate DATETIME
 */
export const getOrganizationUsersAnalysisUsage = `
SELECT
  LP.user_id,
  ISNULL(SUM(LP.area_analyzed_locations_ha), 0) as total_area_analyzed,
  ISNULL(MAX(LP.area_analyzed_locations_ha), 0) as max_area_analyzed,
  COUNT(DISTINCT LP.list_id) as total_lists_analyzed,
  ISNULL(SUM(LP.locations_analyzed), 0) as total_locations_analyzed,
  U.first_name,
  U.last_name
FROM
  [dbo].[ListsProcessing] LP
LEFT JOIN Users U ON LP.user_id = U.id
WHERE
  LP.analysis_end_time >= @startDate
  AND LP.analysis_end_time <= @endDate
  AND LP.user_id IS NOT NULL
GROUP BY
  LP.user_id, U.first_name, U.last_name;
`;

export interface OrganizationUsersAnalysisUsage {
  total_area_analyzed: number;
  max_area_analyzed: number;
  number_of_lists_analyzed: number;
  locations_analyzed: number;
  user_id: number;
  first_name: string;
  last_name: string;
}
