import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { getHALimitForCurrentYearQuery, HALimitForCurrentYear } from '../queries/system';

/**
 * Gets the HA limit for the current year based on update_time in AnalysisLimits.
 * This is used for tokenization to determine the per-year HA allowance.
 *
 * Falls back to 0 if no limit is found for the current year.
 *
 * @param organizationId - The organization ID to get limits for
 * @returns The MaxAreaAnalyzeablePerYear for the current year, or 0 if not found
 */
export async function getHALimitForCurrentYear(organizationId: number): Promise<number> {
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [{ field: 'orgID', type: sql.Int, value: organizationId }];

    const result = await SQLUtils.queryDBFirstRow<HALimitForCurrentYear>(
      databaseName,
      getHALimitForCurrentYearQuery,
      parameters
    );

    return result?.MaxAreaAnalyzeablePerYear ?? 0;
  } catch (error) {
    throw new Error(`Failed to get HA limit for current year: ${error}`);
  }
}
