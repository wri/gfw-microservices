import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { ResponsePreSignedURLModel, ResponseObjectPresignedURLModel } from '../models';
import { ClientStoreConnection, ActivityLog, DeleteListTypeOrm } from '@wri-monorepos/sql';
import { LockListService } from '../services/lock.list.service';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../validators/server-config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class MyObject {
  id: number;
  list_name: string;
  list_locations_count: number;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger('List processing service');
  private readonly s3Client: S3Client;

  constructor(
    private dataSource: DataSource,
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly deleteListTypeOrm: DeleteListTypeOrm,
    private readonly lockListService: LockListService,
    protected readonly config: ConfigService<ServerConfigType, true>
  ) {
    this.s3Client = new S3Client({ region: this.config.get('AWS_REGION', { infer: true }) });
  }

  /**
   *
   * @param key Name of the file
   * @param contentType content type of the file
   * @returns
   */
  async generatePreSignedUrl(
    key: string,
    contentType: string,
    replaceFile = false
  ): Promise<ResponsePreSignedURLModel> {
    const keyFile = replaceFile ? key : `${randomUUID()}-${key}`;
    const largeProcessingListBucket = this.config.get('LARGE_PROCESSING_LIST_BUCKET', {
      infer: true,
    });

    const fileS3Route = `s3://${largeProcessingListBucket}/${keyFile}`;
    const command = new PutObjectCommand({
      Bucket: largeProcessingListBucket,
      Key: keyFile,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { url, keyFile, fileS3Route } as const;
  }

  /**
   * Name of the file is the same as the key
   * @param key
   * @returns
   */
  async getObjectPreSignedUrl(key: string): Promise<ResponseObjectPresignedURLModel> {
    const command = new GetObjectCommand({
      Bucket: this.config.get('LARGE_PROCESSING_LIST_BUCKET', { infer: true }),
      Key: key,
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

    return { url };
  }

  async getFilenameForUser(): Promise<MyObject[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result = await queryRunner.connection.getRepository(MyObject).find();
    return result;
  }

  //Deletes a list from Lists table, and list's attribute and analysis table
  async deleteList(
    list_id: number,
    organizationDatabase: string,
    organization_user_id: number
  ): Promise<string> {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const activityLogRepository = connection.getRepository(ActivityLog);

    try {
      // await DeleteList(organizationDatabase, list_id, organization_user_id);
      const deleteResult = await this.deleteListTypeOrm.delete(
        organizationDatabase,
        list_id,
        organization_user_id
      );
      if (deleteResult) {
        // Save log at ActivityLog table
        const activityLog = new ActivityLog();
        activityLog.userId = organization_user_id;
        activityLog.activityTypeId = 21;
        const confirmationMessage = `User ID ${organization_user_id} has deleted list (${list_id}).`;
        activityLog.activityDescription = confirmationMessage;
        activityLog.activityTime = new Date();
        await activityLogRepository.save(activityLog);

        // Return message that the list was deleted to user
        return confirmationMessage;
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
      const errorDescription = `User ID ${organization_user_id} has tried to delete list (${list_id}) but some error occurs ${error.message}.`;
      activityLog.activityDescription = errorDescription;
      activityLog.activityTime = new Date();
      await activityLogRepository.save(activityLog);
      throw new InternalServerErrorException({
        message: errorDescription,
        code: 603,
      });
    }
  }
}
