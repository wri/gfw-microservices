/**
 * Gets the analysis usage for organization users without aggregation
 * The command requires the following parameters:
 * @startDate DATETIME,
 * @endDate DATETIME
 */
export const getOrganizationUsersUsageExport = `
SELECT
    u.email AS 'Username',
    lp.list_id as 'List ID',
    lp.analysis_type AS 'Analysis Type',
    ISNULL(lp.area_analyzed_locations_ha, 0) AS 'Hectares',
    ISNULL(lp.locations_analyzed, 0) AS 'Locations',
    CAST(ISNULL(cr.location_rate, 0) AS DECIMAL(18, 4)) AS 'Per Location Cost',
    CAST(ISNULL(cr.list_rate, 0) AS DECIMAL(18, 4)) AS 'Processing Cost',
    CAST(
      ISNULL(lp.locations_analyzed, 0) * ISNULL(cr.location_rate, 0)
      + ISNULL(cr.list_rate, 0)
    AS DECIMAL(18, 4)) AS 'Total Cost',
    FORMAT(lp.analysis_end_time, 'dd MMM yyyy HH:mm:ss') + ' GMT' AS 'Date/Timestamp',
    CASE WHEN eu.id IS NOT NULL THEN 'API' ELSE 'UI' END AS 'UI/API'
FROM dbo.ListsProcessing lp
LEFT JOIN dbo.Lists l ON lp.list_id = l.id
OUTER APPLY (
    -- Get the last user who ran one-time ALERTS on this specific list
    SELECT TOP 1 user_id
    FROM dbo.ListsProcessing
    WHERE list_id = lp.list_id
      AND analysis_type = 'ALERTS'
      AND user_id IS NOT NULL
    ORDER BY analysis_end_time DESC
) last_alerts_user
JOIN dbo.Users u ON COALESCE(lp.user_id, last_alerts_user.user_id, l.user_id) = u.id
LEFT JOIN dbo.LargeLists ll ON lp.list_id = ll.list_id
LEFT JOIN dbo.ExternalUploads eu ON ll.s3_filename = eu.uploadKeyFile
OUTER APPLY (
    SELECT TOP 1 cr.location_rate, cr.list_rate
    FROM gfwpro.dbo.ChargeRate cr
    WHERE cr.analysis_type = lp.analysis_type
      AND cr.effective_date <= lp.analysis_end_time
    ORDER BY cr.effective_date DESC
) cr
WHERE lp.analysis_end_time >= @startDate
  AND lp.analysis_end_time < DATEADD(day, 1, @endDate)
  AND (lp.analysis_type <> 'GHG' OR lp.analysis_end_time >= '2025-11-22');
`;

export interface OrganizationUsersAnalysisUsageExport {
  Username: string;
  'List ID': string;
  'Analysis Type': string;
  Hectares: number;
  Locations: number;
  'Per Location Cost': number;
  'Processing Cost': number;
  'Total Cost': number;
  'Date/Timestamp': string;
  'UI/API': string;
}
