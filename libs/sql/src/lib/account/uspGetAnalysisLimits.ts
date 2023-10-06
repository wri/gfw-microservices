import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { AnalysisLimit as AnalysisLimitResponse } from '../queries/system/getAnalysisLimits';

@Injectable()
export class UspGetAnalysisLimits {
  async run(
    organizationId?: number,
    organizationType?: number
  ): Promise<AnalysisLimitResponse | undefined> {
    const parameters = [
      { field: 'orgID', type: sql.Int, value: organizationId || null },
      { field: 'orgType', type: sql.Int, value: organizationType || null },
    ];
    const connection = new SQLUtils({ ...SQL_CONFIG });

    await connection.connect();
    try {
      const recordset = await connection.executeQuery<Promise<AnalysisLimitResponse | undefined>>(
        'uspGetOrganizationAnalysisUsage',
        parameters
      );
      connection.disconnect();

      return recordset;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
