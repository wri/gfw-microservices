import { Injectable } from '@nestjs/common';
import { getNumberOfPagesPaginatedListDataRequest, getPaginatedListDataRequest } from '../models';
import {
  UspGetAnalysisDataCountForUserList,
  UspGetPaginatedAnalysisDataForUserList,
} from '@wri-monorepos/sql';

@Injectable()
export class ListPaginationService {
  constructor(
    private uspGetPaginatedAnalysisDataForUserList: UspGetPaginatedAnalysisDataForUserList,
    private uspGetAnalysisDataCountForUserList: UspGetAnalysisDataCountForUserList
  ) {}

  async getPaginatedListData(queryParam: getPaginatedListDataRequest) {
    const result = await this.uspGetPaginatedAnalysisDataForUserList.run(
      queryParam.organizationDatabase,
      queryParam
    );
    return result ?? [];
  }
  async getNumberOfPagesPaginatedListData(queryParam: getNumberOfPagesPaginatedListDataRequest) {
    const result = await this.uspGetAnalysisDataCountForUserList.run(
      queryParam.organizationDatabase,
      queryParam
    );
    return result ?? [];
  }
  async getPaginatedListDataWithPages(queryParam: getPaginatedListDataRequest) {
    const data = await this.uspGetPaginatedAnalysisDataForUserList.run(
      queryParam.organizationDatabase,
      queryParam
    );
    const pages = await this.uspGetAnalysisDataCountForUserList.run(
      queryParam.organizationDatabase,
      queryParam
    );
    return { data: data ?? [], pages: pages ?? [] };
  }
}
