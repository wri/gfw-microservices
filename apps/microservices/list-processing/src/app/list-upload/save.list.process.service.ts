import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { CreateListInsertResultModel, RequestSaveLargeListProcessModel } from '../../models';
import { SQLUtils } from '@wri-monorepos/sql';
import * as sql from 'mssql';
import { updateListsUploadStatus } from './shared/update.lists.upload.status';

@Injectable()
export class SaveListProcessService {
  constructor(private readonly config: ConfigService<ServerConfigType, true>) {}

  async run(listDetails: RequestSaveLargeListProcessModel): Promise<CreateListInsertResultModel> {
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

      await updateListsUploadStatus(
        listDetails.client_database,
        listDetails.list_id,
        'Save list to process'
      );
      return dataResult;
    } catch (error) {
      await updateListsUploadStatus(
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
