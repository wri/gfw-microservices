import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { DataSource } from 'typeorm';
import * as uniqId from 'uniqid';
import {
  ResponsePreSignedURLModel,
  ResponseObjectPresignedURLModel,
  RequestSaveLargeListProcessModel,
  CreateListInsertResultModel,
} from '../models';
import { SQLUtils, ClientStoreConnection, List, ActivityLog } from '@wri-monorepos/sql';
import * as sql from 'mssql';

class MyObject {
  id: number;
  list_name: string;
  list_locations_count: number;
}

@Injectable()
export class AppService {
  constructor(
    private dataSource: DataSource,
    private readonly clientStoreConnection: ClientStoreConnection
  ) {}

  /**
   *
   * @param key Name of the file
   * @param contentType content type of the file
   * @returns
   */
  generatePreSignedUrl(
    key: string,
    contentType: string,
    replaceFile = false
  ): ResponsePreSignedURLModel {
    const s3 = new S3({ signatureVersion: 'v2' });
    const keyFile = replaceFile ? key : `${uniqId()}-${key}`;
    const fileS3Route = `s3://${process.env.LARGE_PROCESING_LIST_BUCKET}/${keyFile}`;
    const url = s3.getSignedUrl('putObject', {
      Bucket: process.env.LARGE_PROCESING_LIST_BUCKET,
      Key: keyFile,
      ContentType: contentType,
      Expires: 3600,
    });

    return { url, keyFile, fileS3Route };
  }

  /**
   * Name of the file is the same as the key
   * @param key
   * @returns
   */
  getObjectPreSignedUrl(key: string): ResponseObjectPresignedURLModel {
    const s3 = new S3({ signatureVersion: 'v4' });
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.LARGE_PROCESING_LIST_BUCKET,
      Key: key,
      Expires: 300,
    });

    return { url };
  }

  /**
   * @param name Save list to process
   * @returns
   */
  async saveListToProcess(
    listDetails: RequestSaveLargeListProcessModel
  ): Promise<CreateListInsertResultModel> {
    const fileS3Route = `s3://${process.env.LARGE_PROCESING_LIST_BUCKET}/${listDetails.key}`;

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
      return dataResult;
    } catch (error) {
      console.log(error);
    }
  }

  async getFilenameForUser(): Promise<MyObject[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result = await queryRunner.connection.getRepository(MyObject).find();
    return result;
  }

  /**
   * Healthcheck for fargate
   */
  getHealthCheck(): string {
    return 'Healthy';
  }
  //Deletes a list from Lists table, and list's attribute and analysis table
  async deleteList(
    list_id: number,
    organizationDatabase: string,
    organization_user_id: number,
    userEmail: string
  ): Promise<string> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(List);
      const record = await listRepository.findOne({ where: { id: list_id } });
      if (!record) {
        throw new NotFoundException();
      }
      const { lockStatus, lockUserId } = record;
      if (lockStatus === null || (lockStatus !== null && lockUserId !== organization_user_id)) {
        // Reject object
        // Return message that the list is locked to user
        throw { isLocked: true, lockUserId };
      } else {
        // Delete list
        await listRepository.delete({ id: list_id });

        const activityLogRepository = connection.getRepository(ActivityLog);

        if (!activityLogRepository) {
          throw new InternalServerErrorException('Failed to get repository for ActivityLog');
        }
        try {
          // Salve log at ActivityLog table
          const activityLog = new ActivityLog();
          activityLog.userId = organization_user_id;
          activityLog.activityTypeId = 1;
          activityLog.activityDescription = `User '${userEmail}' has deleted list (${record.listName}).`;
          activityLog.activityTime = new Date();
          await activityLogRepository.save(activityLog);

          // Return message that the list was deleted to user
          return `User '${userEmail}' has deleted list (${record.listName}).`;
        } catch (error) {
          // If some problem occurs, return message that the list was not deleted to user
          throw new InternalServerErrorException({
            message: `Failed to delete locations from list id ${list_id}`,
            code: 603,
          });
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow NotFoundException
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }
}
