import { Injectable } from '@nestjs/common';
import {
  SQLUtils,
  getDashboardDataPaginated,
  CountDashboardDataType,
  getCountDashboardData,
  getGFWListsDashboardDataPaginated,
  getCountGFWListsDashboardData,
  DashboardDataPaginated,
} from '@wri-monorepos/sql';
import * as sql from 'mssql';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';

@Injectable()
export class AlertsRepository {
  constructor(private readonly config: ConfigService<ServerConfigType, true>) {}

  async countDashboardData(listID: number, clientDatabase: string) {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDBFirstRow<CountDashboardDataType>(
      clientDatabase,
      getCountDashboardData,
      parameters
    );
  }

  async findDashboardDataByListIdPaginated(
    listID: number,
    clientDatabase: string,
    pageNumber: number,
    rowsPerPage: number
  ) {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'pageNumber', type: sql.Int, value: pageNumber },
      { field: 'rowsPerPage', type: sql.Int, value: rowsPerPage },
    ];

    return await SQLUtils.queryDB<DashboardDataPaginated[]>(
      clientDatabase,
      getDashboardDataPaginated,
      parameters
    );
  }

  async countGFWDashboardData(listID: number) {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDBFirstRow<CountDashboardDataType>(
      this.config.get('MSSQL_DATABASE', { infer: true }),
      getCountGFWListsDashboardData,
      parameters
    );
  }

  async findGFWDashboardDataByListIdPaginated(
    listID: number,
    pageNumber: number,
    rowsPerPage: number
  ) {
    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'pageNumber', type: sql.Int, value: pageNumber },
      { field: 'rowsPerPage', type: sql.Int, value: rowsPerPage },
    ];

    return await SQLUtils.queryDB<DashboardDataPaginated[]>(
      this.config.get('MSSQL_DATABASE', { infer: true }),
      getGFWListsDashboardDataPaginated,
      parameters
    );
  }
}
