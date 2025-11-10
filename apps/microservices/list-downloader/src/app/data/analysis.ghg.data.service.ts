import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { BasicFieldsFileRequest, GHGAnalysisDataByListId } from '@wri-monorepos/sql';
import { IInputData } from './i.input.data';
import { ServerConfigType } from '../../validators/server-config';

@Injectable()
export class AnalysisGhgDataService extends IInputData {
  private readonly logger = new Logger(AnalysisGhgDataService.name);

  constructor(private readonly configService: ConfigService<ServerConfigType, true>) {
    super();
  }

  async getNumberOfPages(filters: BasicFieldsFileRequest, isListLevel: number): Promise<number> {
    const { organizationDatabase, listId, rowsPerPage, isGFWList } = filters;

    const dbName = isGFWList
      ? this.configService.get('MSSQL_DATABASE', { infer: true })
      : organizationDatabase;

    const queryString = `rowsPerPage=${rowsPerPage}&clientDatabase=${dbName}&isListLevel=${isListLevel}`;
    const url = `${this.configService.get(
      'LIST_PROCESSING_MICROSERVICE_URL'
    )}/ghg/${listId}/number-of-pages?${queryString}`;
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
  ): Promise<GHGAnalysisDataByListId[]> {
    const { organizationDatabase, rowsPerPage, page, listId, isGFWList } = filter;

    const dbName = isGFWList
      ? this.configService.get('MSSQL_DATABASE', { infer: true })
      : organizationDatabase;

    const queryString = `rowsPerPage=${rowsPerPage}&pageNumber=${page}&clientDatabase=${dbName}&isListLevel=${isListLevel}`;
    const url = `${this.configService.get(
      'LIST_PROCESSING_MICROSERVICE_URL'
    )}/ghg/${listId}/data-per-page?${queryString}`;

    try {
      const { data } = await axios.get(encodeURI(url));
      return data as GHGAnalysisDataByListId[];
    } catch (error) {
      this.logger.error(`listId: ${listId} , pageNumber: ${page} error: ${error}`);
      return [];
    }
  }
}
