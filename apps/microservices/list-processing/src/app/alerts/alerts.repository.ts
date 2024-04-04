import { Inject, Injectable } from '@nestjs/common';
import {
  DashboardDataType,
  getDashboardData,
  getGFWListsDashboardData,
  SQLUtils,
  GFWList,
  ClientStoreConnection,
  List,
  getDashboardDataPaginated,
  CountDashboardDataType,
  getCountDashboardData,
  getGFWListsDashboardDataPaginated,
  getCountGFWListsDashboardData,
} from '@wri-monorepos/sql';
import * as sql from 'mssql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AlertsRepository {
  @InjectRepository(GFWList, 'default')
  private gfwListRepository: Repository<GFWList>;

  @Inject(ClientStoreConnection)
  private clientStoreConnection: ClientStoreConnection;

  async findDashboardDataByListId(listID: number, clientDatabase: string) {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<DashboardDataType[]>(
      clientDatabase,
      getDashboardData,
      parameters
    );
  }

  async findGFWListDashboardDataByListId(listID: number) {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<DashboardDataType[]>(
      process.env.MSSQL_DATABASE,
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
    const listRepository = connection.getRepository(List);
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
      process.env.MSSQL_DATABASE,
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

    return await SQLUtils.queryDB<DashboardDataType[]>(
      process.env.MSSQL_DATABASE,
      getGFWListsDashboardDataPaginated,
      parameters
    );
  }
}
