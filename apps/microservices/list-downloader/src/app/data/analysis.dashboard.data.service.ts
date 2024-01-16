import { Injectable, Logger } from '@nestjs/common';
import { AnalysisDashboard, GenerationFileRequest } from '@wri-monorepos/sql';
import { IInputData } from './i.input.data';
import axios from 'axios';

@Injectable()
export class AnalysisDashboardDataService extends IInputData {
  private readonly logger = new Logger(AnalysisDashboardDataService.name);

  async getNumberOfPages(filters: GenerationFileRequest): Promise<number> {
    const { organizationDatabase, listId, rowsPerPage } = filters;

    const queryString = `rowsPerPage=1&page=1&clientDatabase=${organizationDatabase}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/analysis/dashboard/${listId}?${queryString}`;
    try {
      const { count } = (await axios.get(encodeURI(url))) as { count: number };
      return Math.ceil(count / rowsPerPage);
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return 0;
    }
  }

  async getDataPaginated(filters: GenerationFileRequest): Promise<AnalysisDashboard[]> {
    const { organizationDatabase, listId, rowsPerPage, page } = filters;

    const queryString = `rowsPerPage=${rowsPerPage}&page=${page}&clientDatabase=${organizationDatabase}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/analysis/dashboard/${listId}?${queryString}`;
    try {
      const { data } = (await axios.get(encodeURI(url))) as { data: AnalysisDashboard[] };
      return data;
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return [];
    }
  }
}
