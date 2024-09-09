import { ClientStoreConnection, SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { AbstractHandler, ChainType } from './types';
import * as sql from 'mssql';
import { sqlConfig } from '../shared/config';

interface QueryCreateTableResult {
  query_string: string;
}

export class CreateLocationSchema extends AbstractHandler<ChainType> {
  private clientStoreConnection: ClientStoreConnection;

  constructor(clientStoreConnection: ClientStoreConnection) {
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
      throw new Error(`Failed to execute ${procedureName}: ${error.message}`);
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

  public async getTableStructureQuery(templateId: number): Promise<QueryCreateTableResult[]> {
    try {
      const connection = await this.clientStoreConnection.getConnection(process.env.MSSQL_DATABASE);
      const command = connection.createQueryRunner();
      await command.connect();
      const queryCreateTableResult: QueryCreateTableResult[] = await command.query(
        'uspGetTableQueryString @0',
        [templateId]
      );

      return queryCreateTableResult;
    } catch (error) {
      throw new Error(`Failed to get table structure query: ${error.message}`);
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

  async handle(input: ChainType): Promise<void> {
    const {
      templateId,
      listId,
      listTable,
      organization_database: clientDatabase,
      analysisTable,
      listStatusId,
      analysisIds,
    } = input.request;

    const queryCreateTableResult = await this.getTableStructureQuery(templateId);
    const connection = new SQLUtils(sqlConfig);

    try {
      await connection.connect();

      await updateListsUploadStatus(connection.databaseName, listId, 'Get table query structure');

      await this.createListTableInDatabase(
        connection,
        listTable,
        queryCreateTableResult[0].query_string
      );

      await this.createAnalysisTableInDatabase(connection, analysisTable);
      await updateListsUploadStatus(connection.databaseName, listId, 'Create analysis table');

      await this.createAnalysisStatusRecords(clientDatabase, listId, listStatusId, analysisIds);
      await updateListsUploadStatus(clientDatabase, listId, 'Create analysis status records');

      await super.handle(input);
    } finally {
      await connection.disconnect();
    }
  }
}
