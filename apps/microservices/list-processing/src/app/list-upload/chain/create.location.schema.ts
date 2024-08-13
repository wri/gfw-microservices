import { ClientStoreConnection, SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { AbstractHandler, ChainType } from './types';
import * as sql from 'mssql';
import { sqlConfig } from '../shared/config';

interface QueryCreateTableResult {
  query_string: string;
}

export class InsertLocationData extends AbstractHandler<ChainType> {
  async createListTableInDatabase(
    connection: SQLUtils,
    listId: number,
    tableName: string,
    sqlQuery: string
  ) {
    try {
      await connection.executeQuery('uspCreateListTable', [
        {
          field: 'table_name',
          type: sql.NVarChar(150),
          value: tableName,
        },
        {
          field: 'query_string',
          type: sql.NVarChar(sql.MAX),
          value: sqlQuery,
        },
      ]);
    } catch (error) {
      throw new Error('Failed create list table: ' + error.message);
    }
  }

  async getTableStructureQuery(templateId: number): Promise<QueryCreateTableResult[]> {
    try {
      const clientStoreConnection = new ClientStoreConnection();
      const connection = await clientStoreConnection.getConnection(process.env.MSSQL_DATABASE);
      const command = connection.createQueryRunner();
      await command.connect();
      const queryCreateTableResult: QueryCreateTableResult[] = await command.query(
        'uspGetTableQueryString @0',
        [templateId]
      );

      return queryCreateTableResult;
    } catch (error) {
      throw new Error('Failed get table structure query: ' + error.message);
    }
  }

  async createAnalysisTableInDatabase(connection: SQLUtils, listId: number, analysisTable: string) {
    try {
      await connection.executeQuery('uspCreateAnalysisTable', [
        {
          field: 'list_analysis_table_name',
          type: sql.NVarChar(150),
          value: analysisTable,
        },
      ]);
    } catch (error) {
      throw new Error('Failed create analysis table: ' + error.message);
    }
  }

  async createAnalysisStatusRecords(
    clientDatabase: string,
    listId: number,
    listStatusId: number,
    analysisIds: Array<string>
  ) {
    try {
      // instead of using 'foreach', 'map' and Promise.all guarantee faster updates
      await Promise.all(
        analysisIds.map(async (analysisId) => {
          await SQLUtils.queryDB(clientDatabase, 'uspCreateListAnalysisStatus', [
            {
              field: 'ListID',
              type: sql.Int,
              value: listId,
            },
            {
              field: 'AnalysisID',
              type: sql.NVarChar(150),
              value: analysisId,
            },
            {
              field: 'Status',
              type: sql.Int,
              value: listStatusId,
            },
          ]);
        })
      );
    } catch (error) {
      throw new Error('Failed create analysis status records: ' + error.message);
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
    await connection.connect();

    await updateListsUploadStatus(connection.databaseName, listId, 'Get table query structure');

    await this.createListTableInDatabase(
      connection,
      listId,
      listTable,
      queryCreateTableResult[0].query_string
    );

    await this.createAnalysisTableInDatabase(connection, listId, analysisTable);
    await updateListsUploadStatus(connection.databaseName, listId, 'Create analysis table');

    await this.createAnalysisStatusRecords(clientDatabase, listId, listStatusId, analysisIds);
    await updateListsUploadStatus(clientDatabase, listId, 'Create analysis status records');
    super.handle(input);
  }
}
