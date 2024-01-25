import { BasicFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { IInputData } from './i.input.data';
import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';


@Injectable()
export class AlertsDataService extends IInputData {

    private readonly logger = new Logger(AlertsDataService.name);
    async getNumberOfPages(filters: BasicFieldsFileRequest): Promise<number> {
      const { organizationDatabase, listId, rowsPerPage } = filters;

      const queryString = `clientDatabase=${organizationDatabase}`;
      const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/alerts/${listId}/countDashboardData?${queryString}`;
      try {
        const { data } = await axios.get(encodeURI(url));
        return Math.ceil(data / rowsPerPage) || 0;
      } catch (error) {
        this.logger.error(`listId: ${listId}, error: ${error}`);
        return 0;
      }
    }
    async getDataPaginated(filters: BasicFieldsFileRequest): Promise<DashboardDataType[]> {
      const { organizationDatabase, rowsPerPage, page, listId } = filters;
      const queryString = `rowsPerPage=${rowsPerPage}&pageNumber=${page}&clientDatabase=${organizationDatabase}`;
      const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/alerts/${listId}/dashboardDataPaginated?${queryString}`;

      try {
        const { data } = await axios.get(encodeURI(url));
        return data as DashboardDataType[];
      } catch (error) {
        this.logger.error(`listId: ${listId} , pageNumber: ${page} error: ${error}`);
        return [];
      }
    }

}
