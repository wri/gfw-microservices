import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ServerConfigType } from '../../validators/server-config';
import {
  CreateListInsertResultModel,
  CreateListRequest,
  RequestLargeListProcess,
  RequestSaveLargeListProcessModel,
  ResponseLargeListProcess,
  ResponseObjectPresignedURLModel,
  ResponsePreSignedURLModel,
} from '../../models';
import { StartAnalysisService } from './start.analysis.service';
import { CreateLargeListService } from './create.large.list.service';
import { SaveListProcessService } from './save.list.process.service';

type ListRequest = {
  listName: string;
  userId: number;
  clientDatabase: string;
  analysisIds: string[];
  templateId?: number;
  gfwListId?: number | null;
  commodity?: string;
  saveAsDraft: boolean;
} & Partial<CreateListRequest>;

interface CreateListResult {
  list_id: number;
}

class MyObject {
  id: number;
  list_name: string;
  list_locations_count: number;
}

@Injectable()
export class ListUploadService {
  private readonly logger = new Logger('List processing service');
  private readonly s3Client: S3Client;

  constructor(
    private dataSource: DataSource,
    protected readonly config: ConfigService<ServerConfigType, true>,

    private readonly startAnalysisService: StartAnalysisService,
    private readonly createLargeListService: CreateLargeListService,

    private readonly saveListProcessService: SaveListProcessService
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
    return await this.dataSource.manager.transaction(async (transactionalEntityManager) => {
      const result = await transactionalEntityManager.getRepository(MyObject).find();
      return result;
    });
  }

  async createNewList(createListRequest: CreateListRequest) {
    try {
      const listTable = await this.createListTables({
        listName: createListRequest.listName,
        userId: createListRequest.userId,
        clientDatabase: createListRequest.clientDatabase,
        analysisIds: createListRequest.analysisIds,
        saveAsDraft: createListRequest.saveAsDraft,
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
    const bucket = this.config.get('LARGE_PROCESSING_LIST_BUCKET', { infer: true });
    request.path = request.path.replace(`s3://${bucket}/`, '');
    return this.startAnalysisService.run(request);
  }

  async createListTables(request: ListRequest): Promise<CreateListResult> {
    return await this.createLargeListService.run(request);
  }

  async saveListToProcess(
    listDetails: RequestSaveLargeListProcessModel
  ): Promise<CreateListInsertResultModel> {
    return await this.saveListProcessService.run(listDetails);
  }
}
