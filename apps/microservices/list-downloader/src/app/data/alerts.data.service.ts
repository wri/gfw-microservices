import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { BasicFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { IInputData } from './i.input.data';
import { ServerConfigType } from '../../validators/server-config';

@Injectable()
export class AlertsDataService extends IInputData {
  private readonly logger = new Logger(AlertsDataService.name);

  constructor(private readonly configService: ConfigService<ServerConfigType, true>) {
    super();
  }

  async getNumberOfPages(filters: BasicFieldsFileRequest): Promise<number> {
    const { organizationDatabase, listId, rowsPerPage, isGFWList } = filters;

    let url = `${this.configService.get('LIST_PROCESSING_MICROSERVICE_URL')}/alerts/${listId}`;

    if (!isGFWList) {
      const queryString = `clientDatabase=${organizationDatabase}`;
      url = `${url}/countDashboardData?${queryString}`;
    } else {
      url = `${url}/countGFWDashboardData`;
    }

    try {
      const { data } = await axios.get(encodeURI(url));
      const { quantity } = data;
      return Math.ceil(quantity / rowsPerPage) || 0;
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return 0;
    }
  }
  async getDataPaginated(filters: BasicFieldsFileRequest): Promise<DashboardDataType[]> {
    const { organizationDatabase, rowsPerPage, page, listId, isGFWList } = filters;

    let queryString = `rowsPerPage=${rowsPerPage}&pageNumber=${page}`;
    let url = `${this.configService.get('LIST_PROCESSING_MICROSERVICE_URL')}/alerts/${listId}`;
    if (!isGFWList) {
      queryString = `${queryString}&clientDatabase=${organizationDatabase}`;
      url = `${url}/dashboardDataPaginated?${queryString}`;
    } else {
      url = `${url}/dashboardGFWDataPaginated?${queryString}`;
    }

    try {
      const { data } = await axios.get(encodeURI(url));
      return data as DashboardDataType[];
    } catch (error) {
      this.logger.error(`listId: ${listId} , pageNumber: ${page} error: ${error}`);
      return [];
    }
  }
}
