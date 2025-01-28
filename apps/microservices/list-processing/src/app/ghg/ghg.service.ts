import {
    SQLUtils,
    CountGHGAnalysisByListId,
    getPaginatedGHGAnalysisListLevel,
    GHGAnalysisByListId,
    getCountGHGAnalysisByListId,
  } from '@wri-monorepos/sql';
  import { Injectable, Logger } from '@nestjs/common';  
  import * as sql from 'mssql';
  
  @Injectable()
  export class GHGService {
    private readonly logger = new Logger(GHGService.name);
  
    async getNumberOfPagesGHGAnalysis(listID: string, queryParam): Promise<CountGHGAnalysisByListId> {
      const { clientDatabase } = queryParam;
  
      const parameters = [
        { field: 'listID', type: sql.Int, value: listID },
      ];
  
      this.logger.debug('Get Number Of Pages GHG Analysis');
      return await SQLUtils.queryDBFirstRow<CountGHGAnalysisByListId>(
        clientDatabase,
        getCountGHGAnalysisByListId,
        parameters
      );
    }
    async getGHGDataPerPage(listId: string, queryParam) {
        const { clientDatabase, rowsPerPage=50, pageNumber=0 } = queryParam;
    
        const parameters = [
          { field: 'listId', type: sql.Int, value: listId },
          { field: 'rowsOfPage', type: sql.Int, value: rowsPerPage },
          { field: 'pageNumber', type: sql.Int, value: pageNumber },
        ];
    
        this.logger.debug('Get data AFI Analysis');
        const query = getPaginatedGHGAnalysisListLevel;
        return await SQLUtils.queryDB<GHGAnalysisByListId[]>(clientDatabase, query, parameters);
      }
}