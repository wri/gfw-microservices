import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { AnalysisLimit as AnalysisLimitResponse } from '../queries/system/getAnalysisLimits';

interface GetAccountAnalysisLimits {
  organizationId?: number;
  organizationType?: number;
}
export async function getAccountAnalysisLimits({
  organizationId,
  organizationType,
}: GetAccountAnalysisLimits) {
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [
      { field: 'orgID', type: sql.Int, value: organizationId ?? null },
      { field: 'orgType', type: sql.Int, value: organizationType ?? null },
    ];

    return SQLUtils.queryDBFirstRow<AnalysisLimitResponse>(
      databaseName,
      'uspGetAnalysisLimits',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
