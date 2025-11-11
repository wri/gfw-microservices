/**
 * This SP is used to get the analysis usage for an organization by analysis type.
 * The command requires the following parameters:
 * @startDate DATETIME,
 * @endDate DATETIME
 */

export const getOrganizationAnalysisUsageByAnalysisType = `
SELECT
  ISNULL(SUM(LP.area_analyzed_locations_ha), 0) as hectares_analyzed,
  COUNT(DISTINCT LP.list_id) as lists_analyzed,
  ISNULL(SUM(LP.locations_analyzed), 0) as locations_analyzed,
  LP.analysis_type
FROM
  [dbo].[ListsProcessing] LP
WHERE
  LP.analysis_end_time >= @startDate
  AND LP.analysis_end_time <= @endDate
GROUP BY
  analysis_type;
`;

export interface OrganizationAnalysisUsageByAnalysisType {
  hectares_analyzed: number;
  max_area_analyzed: number;
  lists_analyzed: number;
  locations_analyzed: number;
  analysis_type: string;
}
