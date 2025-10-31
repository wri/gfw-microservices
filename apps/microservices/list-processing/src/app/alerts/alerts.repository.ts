import { Injectable, Logger } from '@nestjs/common';
import {
  DashboardDataType,
  getDashboardData,
  getGFWListsDashboardData,
  SQLUtils,
  GFWList,
  ClientStoreConnection,
  Lists,
  ListsAnalysisStatus,
  getDashboardDataPaginated,
  CountDashboardDataType,
  getCountDashboardData,
  getGFWListsDashboardDataPaginated,
  getCountGFWListsDashboardData,
} from '@wri-monorepos/sql';
import * as sql from 'mssql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';

@Injectable()
export class AlertsRepository {
  @InjectRepository(GFWList, 'default')
  private gfwListRepository: Repository<GFWList>;

  private readonly logger = new Logger(AlertsRepository.name);

  constructor(
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  // Log how long ago the list was last analyzed for alerts.
  // This will help determine how often alerts are used and freshness/staleness of lists.
  private async logAlertsList(listID: number, clientDatabase: string, paginated = false) {
    const connection = await this.createOrganizationConnection(clientDatabase);
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
    const listAnalysisStatus = await listAnalysisStatusRepository.findOne({
      where: { listId: listID, analysisId: 'Alerts' },
    });
    const lastAnalysisTime = listAnalysisStatus?.updateTime?.getTime() || -Infinity;
    const daysAgo = Math.floor((Date.now() - lastAnalysisTime) / (1000 * 60 * 60 * 24));
    this.logger.log(
      `Fetch alerts for list ${listID} analyzed ${daysAgo} days ago.  LD: ${paginated}`
    );
  }

  async findDashboardDataByListId(listID: number, clientDatabase: string) {
    await this.logAlertsList(listID, clientDatabase);
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<DashboardDataType[]>(
      clientDatabase,
      getDashboardData,
      parameters
    );
  }

  async findGFWListDashboardDataByListId(listID: number) {
    await this.logAlertsList(listID, this.config.get('MSSQL_DATABASE', { infer: true }));
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<DashboardDataType[]>(
      this.config.get('MSSQL_DATABASE', { infer: true }),
      getGFWListsDashboardData,
      parameters
    );
  }

  async findGFWListDashboardTimestampByListId(listID: number) {
    const list = await this.gfwListRepository.findOne({ where: { id: listID } });
    return {
      dashboardLastResults: list.dashboardLastResults,
      dashboardLastSubmit: list.dashboardLastSubmit,
    };
  }

  async findDashboardTimestampByListId(listID: number, clientDatabase: string) {
    const connection = await this.createOrganizationConnection(clientDatabase);
    const listRepository = connection.getRepository(Lists);
    const list = await listRepository.findOne({ where: { id: listID } });
    return {
      dashboardLastResults: list.dashboardLastResults,
      dashboardLastSubmit: list.dashboardLastSubmit,
    };
  }

  async countDashboardData(listID: number, clientDatabase: string) {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDBFirstRow<CountDashboardDataType>(
      clientDatabase,
      getCountDashboardData,
      parameters
    );
  }

  private async createOrganizationConnection(organizationDb: string) {
    return await this.clientStoreConnection.getConnection(organizationDb);
  }

  async findDashboardDataByListIdPaginated(
    listID: number,
    clientDatabase: string,
    pageNumber: number,
    rowsPerPage: number
  ) {
    await this.logAlertsList(listID, clientDatabase, true);

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'pageNumber', type: sql.Int, value: pageNumber },
      { field: 'rowsPerPage', type: sql.Int, value: rowsPerPage },
    ];

    return await SQLUtils.queryDB<DashboardDataType[]>(
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
    await this.logAlertsList(listID, this.config.get('MSSQL_DATABASE', { infer: true }), true);

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'pageNumber', type: sql.Int, value: pageNumber },
      { field: 'rowsPerPage', type: sql.Int, value: rowsPerPage },
    ];

    return await SQLUtils.queryDB<DashboardDataType[]>(
      this.config.get('MSSQL_DATABASE', { infer: true }),
      getGFWListsDashboardDataPaginated,
      parameters
    );
  }
}
