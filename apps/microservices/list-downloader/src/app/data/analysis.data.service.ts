import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import {
  AnalysisDataCountReturnType,
  AnalysisDataType,
  ListFieldsFileRequest,
} from '@wri-monorepos/sql';
import { IInputData } from './i.input.data';
import { ServerConfigType } from '../../validators/server-config';

@Injectable()
export class AnalysisDataService extends IInputData {
  private readonly logger = new Logger(AnalysisDataService.name);

  constructor(private readonly configService: ConfigService<ServerConfigType, true>) {
    super();
  }

  async getNumberOfPages(filters: ListFieldsFileRequest): Promise<number> {
    const { listId } = filters;
    const queryString = this.convertToQueryFields(filters);
    const url = `${this.configService.get(
      'LIST_PROCESSING_MICROSERVICE_URL'
    )}/pages-paginated-list-data?${queryString}`;
    try {
      const { data } = await axios.get(encodeURI(url));
      const { numberOfPages } = data as AnalysisDataCountReturnType;
      return numberOfPages;
    } catch (error) {
      this.logger.error(`listId: ${listId}, error: ${error}`);
      return 0;
    }
  }

  async getDataPaginated(filter: ListFieldsFileRequest): Promise<AnalysisDataType[]> {
    const { listId, page } = filter;
    const queryString = this.convertToQueryFields(filter);
    const url = `${this.configService.get(
      'LIST_PROCESSING_MICROSERVICE_URL'
    )}/paginated-list-data?${queryString}`;
    try {
      const { data } = await axios.get(encodeURI(url));
      return data as AnalysisDataType[];
    } catch (error) {
      this.logger.error(`listId: ${listId} , pageNumber: ${page} error: ${error}`);
      return [];
    }
  }

  private convertToQueryFields(filters: ListFieldsFileRequest): string {
    const fields = [
      'listId',
      'organizationDatabase',
      'analysisAreaMax',
      'analysisAreaMin',
      'country',
      'geometry',
      'orderType',
      'page',
      'rowsPerPage',
      'sortByAttribute',
      'state',
      'subState',
      'locationLogic',
      'locationIds',
      'locationStatement',
      'combinedColumns',
      'searchString',
    ];

    const res = fields.reduce((result, fieldName) => {
      const value = filters[fieldName];
      if (value != undefined || value != null) {
        result += `${fieldName}=${value}&`;
      }
      return result;
    }, '');

    return res.substring(0, res.length - 1);
  }
}
