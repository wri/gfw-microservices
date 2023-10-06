import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';
import { OrganizationAnalysisUsage as OrganizationAnalysisUsageResponse } from '../queries/system/getOrganizationAnalysisUsage';

@Injectable()
export class UspGetOrganizationAnalysisUsage {
  async run(
    startDate: string,
    endDate: string,
    organizationId: number,
    countForEachList: number
  ): Promise<OrganizationAnalysisUsageResponse[]> {
    const parameters = [
      { field: 'startDate', type: sql.NVarChar, value: startDate },
      { field: 'endDate', type: sql.NVarChar, value: endDate },
      { field: 'organization', type: sql.Int, value: organizationId },
      { field: 'countForEachList', type: sql.Int, value: countForEachList },
    ];
    const connection = new SQLUtils({ ...SQL_CONFIG });

    await connection.connect();
    try {
      const response = await connection.executeQuery<Promise<OrganizationAnalysisUsageResponse[]>>(
        'uspGetOrganizationAnalysisUsage',
        parameters
      );
      connection.disconnect();

      const result = response.reduce((acc, value) => {
        value.total_area_analyzed = value.total_area_analyzed ?? 0;
        value.max_area_analyzed = value.max_area_analyzed ?? 0;
        acc.push(value);
        return acc;
      }, []);

      return result;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
