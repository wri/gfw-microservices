/**
 * This SP is used to get the analysis usage for an organization or a list
 * The command requires the following parameters:
 * @organization INT,
 * @startDate DATETIME,
 * @endDate DATETIME
 */

export const getOrganizationAnalysisUsageByAnalysisType = `
SELECT
  user_id,
  ISNULL(SUM(area_analyzed_locations_ha), 0) as total_area_analyzed,
  ISNULL(MAX(area_analyzed_locations_ha), 0) as max_area_analyzed,
  COUNT(DISTINCT list_id) as total_lists_analyzed,
  ISNULL(SUM(locations_analyzed), 0) as total_locations_analyzed,
  analysis_type
FROM
  [dbo].[ListsProcessing]
WHERE
  analysis_end_time >= @startDate
  AND analysis_end_time <= @endDate
GROUP BY
  analysis_type;
`;

export interface OrganizationAnalysisUsageByAnalysisType {
  total_area_analyzed: number;
  max_area_analyzed: number;
  number_of_lists_analyzed: number;
  locations_analyzed: number;
  analysis_type: string;
}
