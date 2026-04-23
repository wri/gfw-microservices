import { ClientStoreConnection } from '../util';
import { OrganizationUsersAnalysisUsageExport } from '../queries/organization/getOrganizationUsersUsageExport';

interface GetAccountUsersAnalysisUsageParameters {
  startDate: string;
  endDate: string;
}

/**
 * Gets detailed analysis usage for organization users with tokenization data
 * Uses raw SQL query to join ListsProcessing with ChargeRate from system database
 * This replaces the stored procedure uspGetOrganizationUsersUsageExport for tokenization support
 *
 * @param orgDbName - The organization database name
 * @param params - Start and end date parameters
 * @returns Array of usage records with tokenization data
 */
export async function getAccountUsersAnalysisUsageExportWithTokenization(
  orgDbName: string,
  { startDate, endDate }: GetAccountUsersAnalysisUsageParameters
): Promise<OrganizationUsersAnalysisUsageExport[]> {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(orgDbName);
  const systemDbName = process.env.MSSQL_DATABASE || 'gfwpro';

  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.997Z`);

  // Raw SQL query that joins ListsProcessing with Users, LargeLists, ExternalUploads,
  // and ChargeRate from system database to get tokenization data
  // For ALERTS-BATCH (weekly alerts), user_id is NULL so we use the last user who ran ALERTS on that list
  const query = `
    SELECT
      u.email AS 'Username',
      lp.list_id as 'List ID',
      STRING_AGG(lp.analysis_type, ',') AS 'Analysis Types',
      ISNULL(lp.area_analyzed_list_ha, 0) AS 'Hectares',
      ISNULL(lp.locations_analyzed, 0) AS 'Locations',        
      FORMAT(lp.analysis_start_time, 'dd MMM yyyy HH:mm:ss') + ' GMT' AS 'Date/Timestamp',
      CASE WHEN COUNT(eu.id) > 0 THEN 'API' ELSE 'UI' END AS 'UI/API',
      -- Tokenization fields (GPV-5226)
      cr.location_rate AS 'Location Rate',
      cr.list_rate AS 'List Rate',
      ISNULL(lp.locations_analyzed, 0) * ISNULL(cr.location_rate, 0) AS 'Token Usage (Locations)',
      ISNULL(cr.list_rate, 0) AS 'Token Usage (Lists)',
      (ISNULL(lp.locations_analyzed, 0) * ISNULL(cr.location_rate, 0)) + ISNULL(cr.list_rate, 0) AS 'Total Tokens',
      CASE 
        WHEN cr.effective_date IS NOT NULL 
        THEN FORMAT(cr.effective_date, 'dd MMM yyyy') 
        ELSE NULL 
      END AS 'Effective Rate Date'
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
    LEFT JOIN [${systemDbName}].[dbo].[ChargeRate] cr ON 
      lp.analysis_type = cr.analysis_type
      AND cr.effective_date = (
        SELECT MAX(cr2.effective_date)
        FROM [${systemDbName}].[dbo].[ChargeRate] cr2
        WHERE cr2.analysis_type = lp.analysis_type
        AND cr2.effective_date <= lp.analysis_end_time
      )
    WHERE lp.analysis_end_time >= @0
      AND lp.analysis_end_time <= @1
      AND (
        lp.analysis_type <> 'ALERTS-BATCH'
        OR lp.analysis_end_time >= '2026-04-18T00:00:00.000Z'
      )
    GROUP BY
      u.email,
      lp.list_id,
      lp.analysis_start_time,
      lp.locations_analyzed,
      lp.area_analyzed_list_ha,
      cr.location_rate,
      cr.list_rate,
      cr.effective_date
    ORDER BY lp.analysis_start_time DESC
  `;

  const results = await connection.query(query, [startDateTime, endDateTime]);

  // Map results to ensure proper types
  return results.map((row: Record<string, unknown>) => ({
    Username: row['Username'] as string,
    'List ID': String(row['List ID']),
    'Analysis Types': row['Analysis Types'] as string,
    Hectares: parseFloat(String(row['Hectares'])) || 0,
    Locations: parseInt(String(row['Locations'])) || 0,
    'Date/Timestamp': row['Date/Timestamp'] as string,
    'UI/API': row['UI/API'] as string,
    // Tokenization fields
    'Location Rate':
      row['Location Rate'] !== null ? parseFloat(String(row['Location Rate'])) : null,
    'List Rate': row['List Rate'] !== null ? parseFloat(String(row['List Rate'])) : null,
    'Token Usage (Locations)':
      row['Token Usage (Locations)'] !== null
        ? parseFloat(String(row['Token Usage (Locations)']))
        : null,
    'Token Usage (Lists)':
      row['Token Usage (Lists)'] !== null ? parseFloat(String(row['Token Usage (Lists)'])) : null,
    'Total Tokens': row['Total Tokens'] !== null ? parseFloat(String(row['Total Tokens'])) : null,
    'Effective Rate Date': row['Effective Rate Date'] as string | null,
  }));
}
