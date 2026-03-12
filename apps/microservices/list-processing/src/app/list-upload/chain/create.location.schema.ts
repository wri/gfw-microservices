import { SQLUtils } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as sql from 'mssql';
import { Logger } from '@nestjs/common';
import { listStatus } from '@wri-monorepos/constants';
import { setListAnalysisStatus } from '@wri-monorepos/geo';

export class CreateLocationSchema extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(CreateLocationSchema.name);
  private clientStoreConnection: SQLUtils;

  constructor(clientStoreConnection: SQLUtils) {
    super();
    this.clientStoreConnection = clientStoreConnection;
  }

  private createSqlParameter(
    field: string,
    type: sql.ISqlType | sql.ISqlTypeFactoryWithNoParams,
    value: string | number
  ) {
    return { field, type, value };
  }

  private async executeQueryWithParams<T>(
    connection: SQLUtils,
    procedureName: string,
    parameters: {
      field: string;
      type: sql.ISqlType | sql.ISqlTypeFactoryWithNoParams;
      value: string | number;
    }[]
  ): Promise<T> {
    try {
      return await connection.executeQuery<T>(procedureName, parameters);
    } catch (error) {
      throw new Error(
        `Failed to execute ${procedureName}: ${error.stack || error.message || error}`
      );
    }
  }

  public async createListTableInDatabase(
    connection: SQLUtils,
    tableName: string,
    sqlQuery: string
  ): Promise<void> {
    const parameters = [
      this.createSqlParameter('table_name', sql.NVarChar(150), tableName),
      this.createSqlParameter('query_string', sql.NVarChar(sql.MAX), sqlQuery),
    ];

    await this.executeQueryWithParams<void>(connection, 'uspCreateListTable', parameters);
  }

  public async createAnalysisTableInDatabase(
    connection: SQLUtils,
    analysisTable: string
  ): Promise<void> {
    const parameters = [
      this.createSqlParameter('list_analysis_table_name', sql.NVarChar(150), analysisTable),
    ];

    await this.executeQueryWithParams<void>(connection, 'uspCreateAnalysisTable', parameters);
  }

  async handle(request: ChainType): Promise<ChainType> {
    const {
      list_id: listId,
      listTable,
      organization_database: organizationDatabase,
      analysisTable,
      saveAsDraft: isSavingAsDraft,
      analysisIds,
      organization_id: organizationId,
      options,
    } = request.request as RequestNewList;

    this.logger.log(`Creating list table ${listTable} in ${organizationDatabase}`);
    const tableStructure =
      '[Location Name] NVARCHAR(150), [Latitude] FLOAT, [Longitude] FLOAT, [Analysis Radius] FLOAT, [Analysis Area] FLOAT, [Commodity] NVARCHAR(150), [Country] NVARCHAR(150), [State] NVARCHAR(150), [Sub State] NVARCHAR(150), [gadmid] NVARCHAR(150), [Geometry] geometry, [location_id] INT PRIMARY KEY, [attributes] NVARCHAR(MAX), [ErrorDetails] NVARCHAR(256) NULL';

    await this.createListTableInDatabase(this.clientStoreConnection, listTable, tableStructure);

    const listStatusId = isSavingAsDraft ? listStatus.Draft : listStatus.Pending;

    await this.createAnalysisTableInDatabase(this.clientStoreConnection, analysisTable);
    this.logger.log(
      `Creating analysis status records for list ${listId} in ${organizationDatabase}`
    );

    await setListAnalysisStatus(
      organizationDatabase,
      listId,
      analysisIds,
      listStatusId,
      organizationId,
      options
    );
    this.logger.log(
      `Created analysis status records for list ${listId} in ${organizationDatabase}`
    );
    return request;
  }
}
