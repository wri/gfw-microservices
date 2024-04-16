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
      const listFounded = await listRepository.findOne({ where: { id: list_id } });
      if (!listFounded) {
        throw new NotFoundException(`List id ${list_id} not found.`);
      }
      const { lockStatus, lockUserId, listTableName, listAnalysisTableName, listName } =
        listFounded;

      if (lockStatus === null) {
        //Lock list
        await this.lockList(organizationDatabase, list_id, organization_user_id);
      }
      // Checking once again
      const { lockStatus: lockStatus_2, lockUserId: lockUserId_2 } = await listRepository.findOne({
        where: { id: list_id },
      });
      if (
        lockStatus_2 === null ||
        (lockStatus_2 !== null && lockUserId_2 !== organization_user_id)
      ) {
        throw { isLocked: true, lockUserId };
      } else {
        // Try to delete list's attributes
        try {
          await connection.query(`DROP TABLE IF EXISTS [${listTableName}]`);
          await connection.query(`DROP TABLE IF EXISTS [${listAnalysisTableName}]`);
        } catch (error) {
          throw new InternalServerErrorException({
            message: `Failed to delete attributes from list id ${list_id}`,
            code: 602,
          });
        }
        // Delete list
        try {
          await listRepository.delete({ id: list_id });
        } catch (error) {
          throw new InternalServerErrorException({
            message: `Failed to delete list ${list_id}`,
            code: 601,
          });
        }
        // delete Analyses
        try {
          await connection.query(`DELETE FROM Analyses WHERE list_id = ${list_id}`);
        } catch (error) {
          throw new InternalServerErrorException({
            message: `Failed to delete analyses ${list_id}`,
            code: 602,
          });
        }
        const activityLogRepository = connection.getRepository(ActivityLog);

        if (!activityLogRepository) {
          throw new InternalServerErrorException('Failed to get repository for ActivityLog');
        }
        try {
          // Salve log at ActivityLog table
          const activityLog = new ActivityLog();
          activityLog.userId = organization_user_id;
          activityLog.activityTypeId = 1;
          activityLog.activityDescription = `User '${userEmail}' has deleted list (${listName}).`;
          activityLog.activityTime = new Date();
          await activityLogRepository.save(activityLog);

          // Return message that the list was deleted to user
          return `User '${userEmail}' has deleted list (${listName}).`;
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
        throw error;
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  private async lockList(
    organizationDatabase: string,
    list_id: number,
    organization_user_id: number
  ): Promise<boolean> {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(List);
    const { lockStatus } = await listRepository.findOne({ where: { id: list_id } });

    if (lockStatus !== null) {
      return false;
    }

    try {
      await listRepository.update(
        { id: list_id },
        { lockStatus: new Date(), lockUserId: organization_user_id }
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to lock list ${list_id}`,
        code: 601,
      });
    }
  }
  private async unlockList(
    organizationDatabase: string,
    list_id: number,
    organization_user_id: number
  ): Promise<boolean> {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(List);
    const { lockStatus, lockUserId } = await listRepository.findOne({ where: { id: list_id } });

    if (lockStatus !== null && lockUserId !== organization_user_id) {
      return false;
    }
    try {
      await listRepository.update(
        { id: list_id },
        { lockStatus: null, lockUserId: organization_user_id }
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to unlock list ${list_id}`,
        code: 601,
      });
    }
  }
}
