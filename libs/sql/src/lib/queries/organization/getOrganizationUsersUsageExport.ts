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
    CASE
      WHEN lp.analysis_type = 'ALERTS-BATCH' THEN 0
      ELSE ISNULL(lp.area_analyzed_locations_ha, 0)
    END AS 'Hectares',
    ISNULL(lp.locations_analyzed, 0) AS 'Locations',
    CAST(ISNULL(lp.locations_analyzed, 0) * ISNULL(cr.location_rate, 0) AS DECIMAL(18, 4)) AS 'Token Cost',
    FORMAT(lp.analysis_end_time, 'dd MMM yyyy HH:mm:ss') + ' GMT' AS 'Date/Timestamp',
    CASE WHEN eu.id IS NOT NULL THEN 'API' ELSE 'UI' END AS 'UI/API'
FROM dbo.ListsProcessing lp
JOIN dbo.Users u ON lp.user_id = u.id
LEFT JOIN dbo.LargeLists ll ON lp.list_id = ll.list_id
LEFT JOIN dbo.ExternalUploads eu ON ll.s3_filename = eu.uploadKeyFile
OUTER APPLY (
    SELECT TOP 1 cr.location_rate
    FROM gfwpro.dbo.ChargeRate cr
    WHERE cr.analysis_type = lp.analysis_type
      AND cr.effective_date <= lp.analysis_end_time
    ORDER BY cr.effective_date DESC
) cr
WHERE lp.user_id IS NOT NULL
  AND lp.analysis_end_time >= @startDate
  AND lp.analysis_end_time < DATEADD(day, 1, @endDate)
  AND (lp.analysis_type <> 'GHG' OR lp.analysis_end_time >= '2025-11-22');
`;

export interface OrganizationUsersAnalysisUsageExport {
  Username: string;
  'List ID': string;
  'Analysis Type': string;
  Hectares: number;
  Locations: number;
  'Token Cost': number;
  'Date/Timestamp': string;
  'UI/API': string;
  // Tokenization fields (GPV-5226)
  'Location Rate': number | null;
  'List Rate': number | null;
  'Token Usage (Locations)': number | null;
  'Token Usage (Lists)': number | null;
  'Total Tokens': number | null;
  'Effective Rate Date': string | null;
}
