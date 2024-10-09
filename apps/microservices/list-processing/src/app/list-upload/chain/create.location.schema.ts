import { SQLUtils } from '@wri-monorepos/sql';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';
import { AbstractHandler, ChainType } from './types';
import * as sql from 'mssql';

interface QueryCreateTableResult {
  query_string: string;
}

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

  public async getTableStructureQuery(): Promise<QueryCreateTableResult> {
    return {
      query_string:
        '[Location Name] NVARCHAR(150),[Latitude] FLOAT,[Longitude] FLOAT,[Analysis Radius] FLOAT,[Analysis Area] FLOAT,[Commodity] NVARCHAR(150),[Location Classification] NVARCHAR(150),[Company ID] NVARCHAR(150),[Volume] INT,[Owner Name] NVARCHAR(150),[Owner ID] NVARCHAR(150),[Company Name] NVARCHAR(150),[Supplier Name] NVARCHAR(150),[Facility Name] NVARCHAR(150),[Refinery Name] NVARCHAR(150),[Certification] NVARCHAR(150),[Start Date] NVARCHAR(150),[End Date] NVARCHAR(150),[Time Horizon] NVARCHAR(150),[Accuracy Rating of Location Entered] INT,[Country] NVARCHAR(150),[State] NVARCHAR(150),[Sub State] NVARCHAR(150),[Wind Barrier] NVARCHAR(150),[Riparian Buffers] NVARCHAR(150),[Buffer Zones] NVARCHAR(150),[gadmid] NVARCHAR(150), [Geometry] geometry, [location_id] INT, [flag_general] INT, [flag_gran_chaco] INT, [flag_glad] INT, [flag_forma] INT, [flag_viirs] INT, [flag_terrai] INT',
    };
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
    const { listId, listTable, organization_database, analysisTable, listStatusId, analysisIds } =
      input.request;

    const queryCreateTableResult = await this.getTableStructureQuery();

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
