import { Injectable, Logger } from '@nestjs/common';
import { AfiAnalysisByListId, BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { IInputData } from './i.input.data';

import axios from 'axios';

@Injectable()
export class AnalysisAfiDataService extends IInputData {
  private readonly logger = new Logger(AnalysisAfiDataService.name);

  async getNumberOfPages(filters: BasicFieldsFileRequest, isListLevel: number): Promise<number> {
    const { organizationDatabase, listId, rowsPerPage } = filters;

    const queryString = `rowsPerPage=${rowsPerPage}&clientDatabase=${organizationDatabase}&isListLevel=${isListLevel}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/afi/${listId}/number-of-pages?${queryString}`;
    try {
      const { data } = await axios.get(encodeURI(url));
      const response = data as { pages: number };
      return response.pages;
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return 0;
    }
  }

  async getDataPaginated(
    filter: BasicFieldsFileRequest,
    isListLevel: number
  ): Promise<AfiAnalysisByListId[]> {
    const { organizationDatabase, rowsPerPage, page, listId } = filter;
    const queryString = `rowsPerPage=${rowsPerPage}&pageNumber=${page}&clientDatabase=${organizationDatabase}&isListLevel=${isListLevel}`;
    const url = `${process.env.LIST_PROCESSING_MICROSERVICE_URL}/afi/${listId}/data-per-page?${queryString}`;

    try {
      const { data } = await axios.get(encodeURI(url));
      return data as AfiAnalysisByListId[];
    } catch (error) {
      this.logger.error(`listId: ${listId} , pageNumber: ${page} error: ${error}`);
      return [];
    }
  }
}
