import {
  SQLUtils,
  getCountAfiAnalysisByListId,
  CountAfiAnalysisByListId,
  getPaginatedAfiAnalysisListLevel,
  getPaginatedAfiAnalysisLocationLevel,
  AfiAnalysisByListId,
} from '@wri-monorepos/sql';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import * as sql from 'mssql';

@Injectable()
export class AfiService {
  private readonly logger = new Logger(AfiService.name);

  sqlConfig = {
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    database: '',
    server: process.env.MSSQL_HOSTNAME,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    port: parseInt(process.env.MSSQL_PORT),
    options: {
      trustServerCertificate: true,
    },
  };

  @Inject(ConfigService)
  private readonly config: ConfigService;

  constructor(private dataSource: DataSource) {}

  async getNumberOfPagesAfiAnalysis(listID: string, queryParam): Promise<CountAfiAnalysisByListId> {
    const { isListLevel, clientDatabase } = queryParam;

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'isListLevel', type: sql.Int, value: isListLevel },
    ];

    const connection = new SQLUtils({
      ...this.sqlConfig,
      database: clientDatabase,
    });

    await connection.connect();

    this.logger.debug('Get Number Of Pages AFI Analysis');
    const createListResult = await connection.query<CountAfiAnalysisByListId>(
      getCountAfiAnalysisByListId,
      parameters
    );

    await connection.disconnect();

    return createListResult;
  }

  async getAfiDataPerPage(listId: string, queryParam) {
    const { clientDatabase, isListLevel, rowsPerPage, pageNumber } = queryParam;

    const parameters = [
      { field: 'listId', type: sql.Int, value: listId },
      { field: 'rowsOfPage', type: sql.Int, value: rowsPerPage },
      { field: 'pageNumber', type: sql.Int, value: pageNumber },
    ];

    const connection = new SQLUtils({
      ...this.sqlConfig,
      database: clientDatabase,
    });

    await connection.connect();
    const query =
      Number(isListLevel) === 1
        ? getPaginatedAfiAnalysisListLevel
        : getPaginatedAfiAnalysisLocationLevel;

    this.logger.debug('Get data AFI Analysis');
    const createListResult = await connection.queryArray<AfiAnalysisByListId>(query, parameters);

    connection.disconnect();

    return createListResult;
  }
}
