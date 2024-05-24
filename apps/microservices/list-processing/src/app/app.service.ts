import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { DataSource } from 'typeorm';
import * as uniqId from 'uniqid';
import { ResponsePreSignedURLModel, ResponseObjectPresignedURLModel } from '../models';
import { ClientStoreConnection, List, ActivityLog, DeleteListTypeOrm } from '@wri-monorepos/sql';
class MyObject {
  id: number;
  list_name: string;
  list_locations_count: number;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger('List processing service');

  constructor(
    private dataSource: DataSource,
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly deleteListTypeOrm: DeleteListTypeOrm
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
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(List);
    const listFound = await listRepository.findOne({ where: { id: list_id } });
    if (!listFound) {
      this.logger.error('DeleteList: list not found');
      throw new NotFoundException(`List id ${list_id} not found.`);
    }
    const { lockStatus, listName } = listFound;
    if (lockStatus === null) {
      //Lock list
      await this.lockList(organizationDatabase, list_id, organization_user_id);
    }
    const activityLogRepository = connection.getRepository(ActivityLog);
    try {
      // await DeleteList(organizationDatabase, list_id, organization_user_id);
      const deleteResult = await this.deleteListTypeOrm.delete(
        organizationDatabase,
        list_id,
        organization_user_id
      );
      if (deleteResult) {
        // Salve log at ActivityLog table
        const activityLog = new ActivityLog();
        activityLog.userId = organization_user_id;
        activityLog.activityTypeId = 21;
        activityLog.activityDescription = `User '${userEmail}' has deleted list (${listName}).`;
        activityLog.activityTime = new Date();
        await activityLogRepository.save(activityLog);

        // Return message that the list was deleted to user
        return `User '${userEmail}' has deleted list (${listName}) - (${list_id}).`;
      } else {
        throw new InternalServerErrorException({
          message: `Failed to delete list ${list_id}`,
          code: 610,
        });
      }
    } catch (error) {
      this.logger.error('DeleteList failure', error);
      const activityLog = new ActivityLog();
      activityLog.userId = organization_user_id;
      activityLog.activityTypeId = 21;
      activityLog.activityDescription = `User '${userEmail}' has tried to delete list (${listName}) - (${list_id}) but some error occurs ${error.message}.`;
      activityLog.activityTime = new Date();
      await activityLogRepository.save(activityLog);
      throw new InternalServerErrorException({
        message: `User '${userEmail}' has tried to delete list (${listName}) - (${list_id}) but some error occurs ${error.message}.`,
        code: 603,
      });
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
        code: 610,
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
        code: 610,
      });
    }
  }
}
