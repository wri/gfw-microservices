import { ListTableColumnsQueryString, SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as sql from 'mssql';

export class CreateLocationSchema extends AbstractHandler<ChainType> {
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
    const parameters = [this.createSqlParameter('template_id', sql.Int, templateId)];

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

  async handle(input: ChainType): Promise<ChainType> {
    const {
      listId,
      listTable,
      organization_database,
      analysisTable,
      listStatusId,
      analysis_types: analysisIds,
      template_id,
    } = input.request as RequestNewList;

    const queryCreateTableResult = await this.getTableStructureQuery(template_id);

    await updateListsUploadStatus(organization_database, listId, 'Get table query structure');

    await this.createListTableInDatabase(
      this.clientStoreConnection,
      listTable,
      queryCreateTableResult.query_string
    );

    await this.createAnalysisTableInDatabase(this.clientStoreConnection, analysisTable);
    await updateListsUploadStatus(organization_database, listId, 'Create analysis table');

    await this.createAnalysisStatusRecords(
      organization_database,
      listId,
      listStatusId,
      analysisIds
    );
    await updateListsUploadStatus(organization_database, listId, 'Create analysis status records');

    return await super.handle(input);
  }
}
