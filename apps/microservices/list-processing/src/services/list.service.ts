import {
  ClientStoreConnection,
  FeatureFlag,
  ListTableColumnsQueryString,
  ListsUploadStatus,
  SQLUtils,
  getListByFilters,
} from '@wri-monorepos/sql';
import { BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CreateListRequest, RequestLargeListProcess, ResponseLargeListProcess } from '../models';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { createListNameSchema } from '../utils/list.utils';
import { RequestSaveLargeListProcessModel, CreateListInsertResultModel } from '../models';
import { MetadataService as AWSMetadataService } from '@wri-monorepos/aws';
import { ServerConfigType } from '../validators/server-config';
import { featureFlagsService } from '@wri-monorepos/shared';
import { DeprecatedStartAnalysisService } from '../app/list-upload/deprecated.start.analysis.service';
import { StartAnalysisService } from '../app/list-upload/start.analysis.service';

interface CreateListResult {
  list_id: number;
}

@Injectable()
export class ListService {
  constructor(
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly awsMetadataService: AWSMetadataService,
    private readonly config: ConfigService<ServerConfigType, true>,
    private readonly deprecatedStartAnalysisService: DeprecatedStartAnalysisService,
    private readonly startAnalysisService: StartAnalysisService
  ) {}

  async createNewList(createListRequest: CreateListRequest) {
    try {
      const listTable = await this.createListTables({
        listName: createListRequest.listName,
        userId: createListRequest.userId,
        clientDatabase: createListRequest.clientDatabase,
        analysisIds: createListRequest.analysisIds,
        organization_id: createListRequest.organization_id,
      });

      const saveListRequest: RequestSaveLargeListProcessModel = {
        key: createListRequest.listName,
        userId: createListRequest.userId,
        list_id: listTable.list_id,
        listName: createListRequest.listName,
        client_database: createListRequest.clientDatabase,
      };

      await this.saveListToProcess(saveListRequest);
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }

  async startAnalysisProcessForList(
    request: RequestLargeListProcess
  ): Promise<ResponseLargeListProcess> {
    const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
    const flags = await getFeatureFlagsForCurrentOrg(request.organization_id);

    const uploadListLpFlag = flags.find((f) => f.flagId === 'UploadListLp') as FeatureFlag;

    if (uploadListLpFlag.flagState) {
      request.path = request.path.replace('s3://gfwpro-lpl-dev/', '');
      return this.startAnalysisService.run(request);
    }
    return this.deprecatedStartAnalysisService.run(request);
  }

  async createListTables({
    listName,
    userId,
    clientDatabase,
    analysisIds,
    organization_id,
    templateId = 13,
    gfwListId = null
  }): Promise<CreateListResult> {
    const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
    const flags = await getFeatureFlagsForCurrentOrg(organization_id);
    const uploadListLpFlag = flags.find((f) => f.flagId === 'UploadListLp') as FeatureFlag;

    if (uploadListLpFlag.flagState) {
      return {
        list_id: -1,
      };
    }

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
        gfwListId
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
    gfwListId: number = null
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
    const parameters = [{ field: 'template_id', type: sql.Int, value: templateId }];

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

  async updateListsUploadStatus(
    clientStore: string,
    listId: number,
    lastSuccessfulStage: string,
    errorInfo?: string
  ): Promise<void> {
    const connection = await this.clientStoreConnection.getConnection(clientStore);
    const repository = connection.getRepository(ListsUploadStatus);
    const { taskARN } = await this.awsMetadataService.getMetadata();

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
      Logger.error('Error updating/inserting record:', error);
    }
  }

  /**
   * @param name Save list to process
   * @returns
   */
  async saveListToProcess(
    listDetails: RequestSaveLargeListProcessModel
  ): Promise<CreateListInsertResultModel> {
    const fileS3Route = `s3://${this.config.get('LARGE_PROCESSING_LIST_BUCKET')}/${
      listDetails.key
    }`;

    try {
      await SQLUtils.queryDB(
        listDetails.client_database,
        `INSERT INTO LargeLists(list_id, organization_user_id, list_name, s3_filename, s3_location, list_status, creation_date) VALUES(@list_id,@organization_user_id,@list_name,@s3_filename,@s3_location,'Created', GETDATE());`,
        [
          {
            field: 'list_id',
            type: sql.Int,
            value: listDetails.list_id,
          },
          {
            field: 'organization_user_id',
            type: sql.Int,
            value: listDetails.userId,
          },
          {
            field: 'list_name',
            type: sql.NVarChar(255),
            value: listDetails.listName,
          },
          {
            field: 's3_filename',
            type: sql.NVarChar(255),
            value: listDetails.key,
          },
          {
            field: 's3_location',
            type: sql.NVarChar(255),
            value: fileS3Route,
          },
        ]
      );
      const dataResult: CreateListInsertResultModel = {
        list_id: listDetails.list_id, //result.records[0].id,
        s3_location: fileS3Route,
      };

      await this.updateListsUploadStatus(
        listDetails.client_database,
        listDetails.list_id,
        'Save list to process'
      );
      return dataResult;
    } catch (error) {
      await this.updateListsUploadStatus(
        listDetails.client_database,
        listDetails.list_id,
        null,
        error.message
      );
      Logger.error(error);
      return error;
    }
  }
}
