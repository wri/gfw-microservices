import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationUsersAnalysisUsage as OrganizationUsersAnalysisUsageResponse } from '../queries';
import { ClientStoreConnection } from '../util';

interface GetAccountUsersAnalysisUsageParameters {
  startDate: string;
  endDate: string;
}

export interface OrganizationUsersAnalysisUsageWithTokenization {
  user_id: number;
  first_name: string;
  last_name: string;
  total_area_analyzed: number;
  total_locations_analyzed: number;
  total_tokens: number;
}

export async function getAccountUsersAnalysisUsage(
  orgDbName: string,
  { startDate, endDate }: GetAccountUsersAnalysisUsageParameters
) {
  try {
    // Format dates to include full day range
    const formattedStartDate = `${startDate}T00:00:00.000Z`;
    const formattedEndDate = `${endDate}T23:59:59.997Z`;

    const parameters = [
      { field: 'startDate', type: sql.NVarChar, value: formattedStartDate },
      { field: 'endDate', type: sql.NVarChar, value: formattedEndDate },
    ];

    return await SQLUtils.queryDB<[OrganizationUsersAnalysisUsageResponse]>(
      orgDbName,
      'uspGetOrganizationUsersAnalysisUsage',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Gets analysis usage for organization users with tokenization data.
 * Uses raw SQL to join ListsProcessing with ChargeRate from the system database
 * to compute total tokens per user.
 */
export async function getAccountUsersAnalysisUsageWithTokenization(
  orgDbName: string,
  { startDate, endDate }: GetAccountUsersAnalysisUsageParameters
): Promise<OrganizationUsersAnalysisUsageWithTokenization[]> {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(orgDbName);
  const systemDbName = process.env.MSSQL_DATABASE || 'gfwpro';

  const startDateTime = new Date(`${startDate}T00:00:00.000Z`);
  const endDateTime = new Date(`${endDate}T23:59:59.997Z`);

  // Raw SQL joining ListsProcessing with ChargeRate (cross-DB) to aggregate
  // total tokens per user. Tokens per run = locations * location_rate + list_rate.
  const query = `
    SELECT
      lp.user_id,
      u.first_name,
      u.last_name,
      ISNULL(SUM(lp.area_analyzed_locations_ha), 0) AS total_area_analyzed,
      ISNULL(SUM(lp.locations_analyzed), 0) AS total_locations_analyzed,
      ISNULL(SUM(
        ISNULL(lp.locations_analyzed, 0) * ISNULL(cr.location_rate, 0)
        + ISNULL(cr.list_rate, 0)
      ), 0) AS total_tokens
    FROM [dbo].[ListsProcessing] lp
    JOIN [dbo].[Users] u ON lp.user_id = u.id
    LEFT JOIN [${systemDbName}].[dbo].[ChargeRate] cr ON
      lp.analysis_type = cr.analysis_type
      AND cr.effective_date = (
        SELECT MAX(cr2.effective_date)
        FROM [${systemDbName}].[dbo].[ChargeRate] cr2
        WHERE cr2.analysis_type = lp.analysis_type
        AND cr2.effective_date <= lp.analysis_end_time
      )
    WHERE lp.user_id IS NOT NULL
      AND lp.analysis_end_time >= @0
      AND lp.analysis_end_time <= @1
    GROUP BY lp.user_id, u.first_name, u.last_name
  `;

  const results = await connection.query(query, [startDateTime, endDateTime]);

  return results.map((row: Record<string, unknown>) => ({
    user_id: Number(row['user_id']),
    first_name: row['first_name'] as string,
    last_name: row['last_name'] as string,
    total_area_analyzed: parseFloat(String(row['total_area_analyzed'])) || 0,
    total_locations_analyzed: parseInt(String(row['total_locations_analyzed'])) || 0,
    total_tokens: parseFloat(String(row['total_tokens'])) || 0,
  }));
}
