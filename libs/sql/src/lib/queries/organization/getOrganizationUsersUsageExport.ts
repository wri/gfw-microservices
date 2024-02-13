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
    (SELECT 
        STRING_AGG(l.analysis_type, ', ') 
    AS Result FROM dbo.ListsProcessing l 
    WHERE l.list_id = lp.list_id) AS 'Analysis Types',
    ISNULL(lp.area_analyzed_list_ha, 0) AS 'Hectares',
    ISNULL(lp.locations_analyzed, 0) AS 'Locations',        
    FORMAT(lp.analysis_start_time, 'dd MMM yyyy HH:mm:ss') + ' GMT' AS 'Date/Timestamp',
    CASE WHEN COUNT(ll.list_id) > 0 THEN 'API' ELSE 'UI' END AS 'UI/API'
FROM dbo.ListsProcessing lp
JOIN dbo.Users u ON lp.user_id = u.id
LEFT JOIN dbo.LargeLists ll ON lp.list_id = ll.list_id
LEFT JOIN dbo.ExternalUploads eu ON ll.s3_filename = eu.uploadKeyFile 
GROUP BY
  u.email,
  lp.list_id,
  lp.analysis_start_time,
  lp.locations_analyzed,
  lp.area_analyzed_list_ha;
`;

export interface OrganizationUsersAnalysisUsageExport {
  Username: string;
  'List ID': string;
  'Analysis Types': string;
  Hectares: number;
  Locations: number;
  'Date/Timestamp': string;
  'UI/API': string;
}
