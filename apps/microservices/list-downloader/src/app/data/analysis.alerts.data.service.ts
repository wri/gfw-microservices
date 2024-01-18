import { Injectable, Logger } from '@nestjs/common';
import { AnalysisDashboard, GenerationFileRequest } from '@wri-monorepos/sql';
import { IInputData } from './i.input.data';
import axios from 'axios';

@Injectable()
export class AnalysisAlertsDataService extends IInputData {
  private readonly logger = new Logger(AnalysisAlertsDataService.name);

  constructor() {
    super();
  }

  async getNumberOfPages(filters: GenerationFileRequest): Promise<number> {
    const { organizationDatabase, listId, rowsPerPage } = filters;

    const queryString = `rowsPerPage=1&page=1&clientDatabase=${organizationDatabase}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/analysis/alerts/${listId}?${queryString}`;
    try {
      const { data } = await axios.get(encodeURI(url));
      const { count } = data;
      return Math.ceil(count / rowsPerPage);
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return 0;
    }
  }

  async getDataPaginated(filters: GenerationFileRequest): Promise<AnalysisDashboard[]> {
    const { organizationDatabase, listId, rowsPerPage, page } = filters;

    const queryString = `rowsPerPage=${rowsPerPage}&page=${page}&clientDatabase=${organizationDatabase}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/analysis/alerts/${listId}?${queryString}`;
    console.log('url', url);
    try {
      const { data } = (await axios.get(encodeURI(url))) as { data: AnalysisDashboard[] };
      return data;
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return [];
    }
  }
}
