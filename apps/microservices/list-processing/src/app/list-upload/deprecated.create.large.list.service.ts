import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateListRequest } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { setListAnalysisStatus, CreateListResult } from '@wri-monorepos/geo';
import {
  ClientStoreConnection,
  getListByFilters,
  ListsUploadStatus,
  ListTableColumnsQueryString,
  SqlParamType,
  SQLUtils,
} from '@wri-monorepos/sql';
import * as sql from 'mssql';
import { MetadataService as AWSMetadataService } from '@wri-monorepos/aws';
import { createListNameSchema } from '../../utils/list.utils';

const LIST_UPLOAD_VERSION = 2;
const LIST_UPLOAD_LEGACY_VERSION = 0;

@Injectable()
export class DeprecatedCreateLargeListService {
  constructor(
    private readonly clientStoreConnection: ClientStoreConnection,
    // eslint-disable-next-line no-undef
    private readonly awsMetadataService: AWSMetadataService,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  async run({
    listName,
    userId,
    clientDatabase,
    analysisIds,
    templateId = 13,
    gfwListId = null,
    isUploadListLpEnabled = false,
  }: {
    templateId?: number;
    gfwListId?: number | null;
    isUploadListLpEnabled?: boolean;
  } & Partial<CreateListRequest>) {
    const list = createListNameSchema(listName);
    const listTable = list.list_table;
    const analysisTable = list.analysis_table;
    const listStatusId = 1; // Pending
    const locationClassification = 'Property';
    const customAttributeNames = '';
    const customAttributeTypes = '';

    let createListResult: CreateListResult;
    const doesListNameAlreadyExist = await getListByFilters({ listName: listName }, clientDatabase);

    if (doesListNameAlreadyExist) {
      throw new BadRequestException(`List name ${listName} already exists.`);
    }

    const sqlConfig = {
      user: this.config.get('MSSQL_USERNAME', { infer: true }),
      password: this.config.get('MSSQL_PASSWORD', { infer: true }),
      database: clientDatabase,
      server: this.config.get('MSSQL_HOSTNAME', { infer: true }),
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      port: this.config.get('MSSQL_PORT', { infer: true }),
      options: {
        //encrypt: true, // for azure
        trustServerCertificate: true, // change to true for local dev / self-signed certs
      },
    };

    const connection = new SQLUtils(sqlConfig);
    await connection.connect();

    try {
      // Create a new list in table
      createListResult = await this.insertListInListTable(
        connection,
        userId,
        templateId,
        listName,
        listTable,
        analysisTable,
        listStatusId,
        locationClassification,
        customAttributeNames,
        customAttributeTypes,
        gfwListId,
        isUploadListLpEnabled
      );
      await this.updateListsUploadStatus(
        connection.databaseName,
        createListResult.list_id,
        'Insert row in List table'
      );

      const listId = createListResult.list_id;

      await this.addListToAnalysesTable(connection, listId);
      await this.updateListsUploadStatus(
        connection.databaseName,
        listId,
        'Add list to analysis table'
      );

      const { query_string } = await this.getTableStructureQuery(templateId);

      await this.updateListsUploadStatus(
        connection.databaseName,
        listId,
        'Get table query structure'
      );

      await this.createListTableInDatabase(connection, listId, listTable, query_string);
      await this.updateListsUploadStatus(connection.databaseName, listId, 'Create list table');

      await this.createAnalysisTableInDatabase(connection, listId, analysisTable);
      await this.updateListsUploadStatus(connection.databaseName, listId, 'Create analysis table');

      await this.createAnalysisStatusRecords(clientDatabase, listId, listStatusId, analysisIds);
      await this.updateListsUploadStatus(clientDatabase, listId, 'Create analysis status records');

      return createListResult;
    } catch (error) {
      await connection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar(255),
          value: list.list_table,
        },
      ]);

      await connection.executeQuery('uspDropOrganizationTable', [
        {
          field: 'table_name',
          type: sql.NVarChar(255),
          value: list.analysis_table,
        },
      ]);

      let { list_id: listId } = createListResult ?? {};
      if (listId) {
        // can't rollback anything if there is no list id
        await connection.executeQuery('dropListAnalysisStatusByListId', [
          {
            field: 'ListID',
            type: sql.Int,
            value: listId,
          },
        ]);
      }

      if (!listId) {
        // In case no record was inserted we need to log to a unexisting record
        listId = -999;
      }

      await this.updateListsUploadStatus(clientDatabase, listId, null, error.message);
      Logger.error(error);
      return error;
    }
  }

  async updateListsUploadStatus(
    clientStore: string,
    listId: number,
    lastSuccessfulStage: string,
    errorInfo?: string
  ): Promise<void> {
    const connection = await this.clientStoreConnection.getConnection(clientStore);
    const repository = connection.getRepository(ListsUploadStatus);
    const { taskARN } = await this.awsMetadataService.getMetadata();
    errorInfo = errorInfo?.substring(0, 511);

    try {
      const existingRecord = await repository.findOne({ where: { listId } });

      if (existingRecord) {
        existingRecord.errorInfo = errorInfo;
        existingRecord.lastSuccessfulStage =
          lastSuccessfulStage ?? existingRecord.lastSuccessfulStage;
        existingRecord.updateTime = new Date();
        existingRecord.workerInstanceId = taskARN;
        await repository.save(existingRecord);
      } else {
        const newRecord = new ListsUploadStatus();
        newRecord.listId = listId;
        newRecord.errorInfo = errorInfo;
        newRecord.lastSuccessfulStage = lastSuccessfulStage ?? newRecord.lastSuccessfulStage;
        newRecord.updateTime = new Date();
        newRecord.workerInstanceId = taskARN;
        await repository.save(newRecord);
      }
    } catch (error) {
      Logger.error('Error updating/inserting record:', error.stack);
    }
  }

  async insertListInListTable(
    connection: SQLUtils,
    userId: number,
    templateId: number,
    listName: string,
    listTable: string,
    analysisTable: string,
    listStatusId: number,
    locationClassification: string,
    customAttributeNames: string,
    customAttributeTypes: string,
    gfwListId: number = null,
    isUploadListLpEnabled,
    commodity: string = null
  ) {
    try {
      const parameters = [
        { field: 'user_id', type: sql.Int, value: userId },
        { field: 'template_id', type: sql.Int, value: templateId },
        { field: 'list_name', type: sql.NVarChar(150), value: listName },
        {
          field: 'list_table_name',
          type: sql.NVarChar(150),
          value: listTable,
        },
        {
          field: 'list_analysis_table_name',
          type: sql.NVarChar(150),
          value: analysisTable,
        },
        { field: 'list_status_id', type: sql.Int, value: listStatusId },
        {
          field: 'location_classification',
          type: sql.NVarChar(150),
          value: locationClassification,
        },
        {
          field: 'custom_attribute_names',
          type: sql.NVarChar(2000),
          value: customAttributeNames,
        },
        {
          field: 'custom_attribute_types',
          type: sql.NVarChar(2000),
          value: customAttributeTypes,
        },
        { field: 'associated_gfwlist', type: sql.TinyInt, value: gfwListId },
        {
          field: 'version',
          type: sql.Int,
          value: isUploadListLpEnabled ? LIST_UPLOAD_VERSION : LIST_UPLOAD_LEGACY_VERSION,
        },
        {
          field: 'commodity',
          type: sql.NVarChar(150),
          value: commodity,
        },
      ];

      const createListResult = await connection.executeQuery<CreateListResult>(
        'uspCreateList',
        parameters
      );

      return createListResult;
    } catch (error) {
      throw new Error('Failed insert row in List Table: ' + error.message);
    }
  }

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

  async addListToAnalysesTable(connection: SQLUtils, listId: number) {
    try {
      await connection.executeQuery('uspAddListToAnalyses', [
        {
          field: 'list_id',
          type: sql.Int,
          value: listId,
        },
      ]);
    } catch (error) {
      throw new Error('Failed add list to analysis table: ' + error.message);
    }
  }

  async getTableStructureQuery(templateId: number): Promise<ListTableColumnsQueryString> {
    const conn = new SQLUtils();
    const params: SqlParamType[] = [
      { field: 'template_id', type: sql.NVarChar(150), value: templateId },
    ];
    for (let i = 0; i < 3; i++) {
      params.push({
        field: `custom_attribute_${i + 1}`,
        type: sql.NVarChar(50),
        value: null,
      });
      params.push({
        field: `custom_attribute_${i + 1}_type`,
        type: sql.NVarChar(50),
        value: null,
      });
    }

    try {
      await conn.connect();
      return await conn.executeQuery<ListTableColumnsQueryString>('uspGetTableQueryString', params);
    } catch (error) {
      throw new Error(
        `Failed to get table structure query: ${error.stack || error.message || error}`
      );
    }
  }

  async createAnalysisStatusRecords(
    clientDatabase: string,
    listId: number,
    listStatusId: number,
    analysisIds: Array<string>
  ) {
    try {
      await setListAnalysisStatus(clientDatabase, listId, analysisIds, listStatusId);
    } catch (error) {
      throw new Error('Failed create analysis status records: ' + error.message);
    }
  }
}