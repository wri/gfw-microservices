import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { MetadataService as AWSMetadataService } from '@wri-monorepos/aws';
import { CreateListInsertResultModel, RequestSaveLargeListProcessModel } from '../../models';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { ClientStoreConnection, ListsUploadStatus, SQLUtils } from '@wri-monorepos/sql';

@Injectable()
export class SaveListToProcessService {
  constructor(
    private readonly awsMetadataService: AWSMetadataService,
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {}

  async run(listDetails: RequestSaveLargeListProcessModel) {
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
}
