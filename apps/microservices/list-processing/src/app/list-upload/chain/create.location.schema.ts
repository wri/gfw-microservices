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
    } = request.request as RequestNewList;

    this.logger.log(
      `[List ${listId}] CreateLocationSchema: Starting table creation for ${listTable} in ${organizationDatabase}`
    );
    const tableStructure =
      '[Location Name] NVARCHAR(150), [Latitude] FLOAT, [Longitude] FLOAT, [Analysis Radius] FLOAT, [Analysis Area] FLOAT, [Commodity] NVARCHAR(150), [Country] NVARCHAR(150), [State] NVARCHAR(150), [Sub State] NVARCHAR(150), [gadmid] NVARCHAR(150), [Geometry] geometry, [location_id] INT PRIMARY KEY, [attributes] NVARCHAR(MAX), [ErrorDetails] NVARCHAR(256) NULL';

    // Step 1: Create list table
    const listTableStart = Date.now();
    this.logger.log(
      `[List ${listId}] CreateLocationSchema: Step 1 - Creating list table ${listTable}`
    );
    await this.createListTableInDatabase(this.clientStoreConnection, listTable, tableStructure);
    const listTableDuration = Date.now() - listTableStart;
    this.logger.log(
      `[List ${listId}] CreateLocationSchema: Step 1 completed in ${listTableDuration}ms`
    );

    const listStatusId = isSavingAsDraft ? listStatus.Draft : listStatus.Pending;

    // Step 2: Create analysis table
    const analysisTableStart = Date.now();
    this.logger.log(
      `[List ${listId}] CreateLocationSchema: Step 2 - Creating analysis table ${analysisTable}`
    );
    await this.createAnalysisTableInDatabase(this.clientStoreConnection, analysisTable);
    const analysisTableDuration = Date.now() - analysisTableStart;
    this.logger.log(
      `[List ${listId}] CreateLocationSchema: Step 2 completed in ${analysisTableDuration}ms`
    );

    // Step 3: Set analysis status records
    const statusRecordsStart = Date.now();
    this.logger.log(
      `[List ${listId}] CreateLocationSchema: Step 3 - Creating analysis status records (${
        analysisIds?.length || 0
      } analyses)`
    );
    await setListAnalysisStatus(organizationDatabase, listId, analysisIds, listStatusId);
    const statusRecordsDuration = Date.now() - statusRecordsStart;
    this.logger.log(
      `[List ${listId}] CreateLocationSchema: Step 3 completed in ${statusRecordsDuration}ms`
    );

    const totalDuration = Date.now() - listTableStart;
    this.logger.log(
      `[List ${listId}] CreateLocationSchema: All steps completed in ${totalDuration}ms`
    );

    return request;
  }
}
