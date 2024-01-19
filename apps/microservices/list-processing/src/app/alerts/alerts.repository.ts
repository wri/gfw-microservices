import { Injectable } from '@nestjs/common';
import {
  DashboardDataType,
  getDashboardData,
  getGFWListsDashboardData,
  SQLUtils,
  GFWList,
  ClientStoreConnection,
  List,
} from '@wri-monorepos/sql';
import * as sql from 'mssql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AlertsRepository {
  constructor(
    @InjectRepository(GFWList, 'default')
    private gfwListRepository: Repository<GFWList>,
    private readonly clientStoreConnection: ClientStoreConnection
  ) {}

  async findDashboardData(listID: number, clientDatabase: string) {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<DashboardDataType[]>(
      clientDatabase,
      getDashboardData,
      parameters
    );
  }

  async findGFWListDashboardData(listID: number) {
    const parameters = [{ field: 'listID', type: sql.Int, value: listID }];

    return await SQLUtils.queryDB<DashboardDataType[]>(
      'gfwpro',
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

  private async createOrganizationConnection(organizationDb: string) {
    return await this.clientStoreConnection.getConnection(organizationDb);
  }
}
