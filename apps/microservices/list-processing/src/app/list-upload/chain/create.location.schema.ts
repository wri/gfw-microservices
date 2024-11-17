import { ListTableColumnsQueryString, SQLUtils } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as sql from 'mssql';
import { Logger } from '@nestjs/common';

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

  public async getTableStructureQuery(templateId: number): Promise<ListTableColumnsQueryString> {
    const conn = new SQLUtils();
    const parameters = [
      this.createSqlParameter('template_id', sql.Int, templateId),
      this.createSqlParameter('custom_attribute_1', sql.NVarChar(50), null),
      this.createSqlParameter('custom_attribute_1_type', sql.NVarChar(50), null),
      this.createSqlParameter('custom_attribute_2', sql.NVarChar(50), null),
      this.createSqlParameter('custom_attribute_2_type', sql.NVarChar(50), null),
      this.createSqlParameter('custom_attribute_3', sql.NVarChar(50), null),
      this.createSqlParameter('custom_attribute_3_type', sql.NVarChar(50), null),
    ];

    try {
      await conn.connect();
      return await conn.executeQuery<ListTableColumnsQueryString>(
        'uspGetTableQueryString',
        parameters
      );
    } catch (error) {
      throw new Error(
        `Failed to get table structure query: ${error.stack || error.message || error}`
      );
    }
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

  public async createAnalysisStatusRecords(
    clientDatabase: string,
    listId: number,
    listStatusId: number,
    analysisIds: string[]
  ): Promise<void> {
    try {
      await Promise.all(
        analysisIds.map(async (analysisId) => {
          await SQLUtils.queryDB(clientDatabase, 'uspCreateListAnalysisStatus', [
            this.createSqlParameter('ListID', sql.Int, listId),
            this.createSqlParameter('AnalysisID', sql.NVarChar(150), analysisId),
            this.createSqlParameter('Status', sql.Int, listStatusId),
          ]);
        })
      );
    } catch (error) {
      throw new Error(`Failed to create analysis status records: ${error.message}`);
    }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const {
      listId,
      listTable,
      organization_database,
      analysisTable,
      listStatusId,
      analysisIds,
      template_id,
    } = request.request as RequestNewList;

    const queryCreateTableResult = await this.getTableStructureQuery(template_id);
    this.logger.log(`Creating list table ${listTable} in ${organization_database}`);

    await this.createListTableInDatabase(
      this.clientStoreConnection,
      listTable,
      queryCreateTableResult.query_string
    );

    await this.createAnalysisTableInDatabase(this.clientStoreConnection, analysisTable);
    this.logger.log(
      `Creating analysis status records for list ${listId} in ${organization_database}`
    );

    await this.createAnalysisStatusRecords(
      organization_database,
      listId,
      listStatusId,
      analysisIds
    );
    this.logger.log(
      `Created analysis status records for list ${listId} in ${organization_database}`
    );
    return request;
  }
}
