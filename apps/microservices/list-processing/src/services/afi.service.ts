import {
  SQLUtils,
  getCountAfiAnalysisByListId,
  CountAfiAnalysisByListId,
  getPaginatedAfiAnalysisByListId,
  GetPaginatedAfiAnalysisByListId,
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

  async getAfiDataPerPage(listID: string, queryParam) {
    const { clientDatabase, isListLevel, rowsPerPage, pageNumber } = queryParam;

    const parameters = [
      { field: 'listID', type: sql.Int, value: listID },
      { field: 'isListLevel', type: sql.Int, value: isListLevel },
      { field: 'RowsOfPage', type: sql.Int, value: rowsPerPage },
      { field: 'PageNumber', type: sql.Int, value: pageNumber },
    ];

    const connection = new SQLUtils({
      ...this.sqlConfig,
      database: clientDatabase,
    });

    await connection.connect();

    this.logger.debug('Get data AFI Analysis');
    this.logger.log(getPaginatedAfiAnalysisByListId);
    const createListResult = await connection.queryArray<GetPaginatedAfiAnalysisByListId>(
      getPaginatedAfiAnalysisByListId,
      parameters
    );

    connection.disconnect();

    return createListResult;
  }
}
