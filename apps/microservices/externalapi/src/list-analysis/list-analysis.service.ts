import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AlertsGenerateBodySchema, ListAnalysisResponse } from './list-analysis.dto';
import { UserService } from './user.service';
import { ExternalUpload } from './external-upload.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { generateRandomFilename } from '@wri-monorepos/shared';
import { ClientStoreConnection } from '../shared/client-store-connection';
import { OrganizationService } from './organization.service';
import { ListsAnalysisStatus } from './list-analysis-status.entity';
import { transformExternalUpload } from './transformers';
import {
  ListUploadNewErrorResponse,
  ListUploadNewRequestSchema,
  ListUploadNewResponse,
  PrepareUploadRequestSchema,
} from './list-upload-new.dto';
import { Organization } from '../api-keys/organization.entity';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { throwCustomErrorResponse } from './utils/throw-custom-error-response';
import { getListStatusString, listStatus } from '@wri-monorepos/constants';
import { SqsService } from '@ssut/nestjs-sqs';
import { AWS_DOWNLOADER_QUEUE_IDENTIFIER } from '../config';
import { generateAlertsSqsTemplate } from '../shared/generate-sqs-templates';
import { ListService } from '../lists/lists.service';

const LIST_INITIAL_STATUS = 'Pending';
const MIN_FILE_SIZE_IN_BYTES = 300;

const contentType = {
  csv: 'text/csv',
  zip: 'application/x-zip-compressed',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

@Injectable()
export class ListAnalysisService {
  private readonly LLP_BASE_URL: string;
  private readonly AWS_ACCESS_KEY_ID: string;
  private readonly AWS_REGION: string;
  private readonly AWS_SECRET_ACCESS_KEY: string;
  private readonly LARGE_PROCESING_LIST_BUCKET: string;
  private readonly logger = new Logger(ListAnalysisResponse.name);
  constructor(
    private config: ConfigService,
    private userService: UserService,
    private clientStoreConnection: ClientStoreConnection,
    private organizationService: OrganizationService,
    private readonly sqsService: SqsService,
    private readonly listService: ListService
  ) {
    this.LLP_BASE_URL = this.config.get<string>('LLP_BASE_URL');
    this.AWS_ACCESS_KEY_ID = this.config.get<string>('AWS_ACCESS_KEY_ID');
    this.AWS_REGION = this.config.get<string>('AWS_REGION');
    this.AWS_SECRET_ACCESS_KEY = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.LARGE_PROCESING_LIST_BUCKET = this.config.get<string>('LARGE_PROCESING_LIST_BUCKET');
  }

  private getEAPIListStatus(listAnalysisStatus: ListsAnalysisStatus) {
    if (
      listAnalysisStatus.status === listStatus.Active &&
      listAnalysisStatus.expirationTime &&
      listAnalysisStatus.s3URL &&
      Date.now() < listAnalysisStatus.expirationTime.getTime()
    ) {
      return 'Completed';
    }

    if (
      listAnalysisStatus.status === listStatus.Active &&
      listAnalysisStatus.expirationTime &&
      listAnalysisStatus.s3URL &&
      Date.now() > listAnalysisStatus.expirationTime.getTime()
    ) {
      return 'Expired';
    }

    return getListStatusString(listAnalysisStatus.status);
  }

  // Replace this with actual database or external service calls
  async getAnalysisStatus({
    analysisId,
    listId,
    organizationId,
  }: {
    organizationId: number;
    listId: number;
    analysisId: string;
  }): Promise<ListAnalysisResponse> {
    const connection = await this.getOrganizationConnection(organizationId);
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
    const listAnalysisStatus = await listAnalysisStatusRepository.findOne({
      where: { listId, analysisId },
    });

    if (!listAnalysisStatus) {
      throw new NotFoundException('Analysis status not found.');
    }
    // Verify if expiration time is in the past
    let listStatusExpired = false;
    if (
      listAnalysisStatus.expirationTime &&
      Date.now() > listAnalysisStatus.expirationTime.getTime()
    ) {
      listStatusExpired = true;
    }
    const analysisStatus: ListAnalysisResponse = {
      listId: listAnalysisStatus.listId.toString(),
      status: this.getEAPIListStatus(listAnalysisStatus),
      errorsDetails: (listAnalysisStatus.errorInfo || '').split('\n').filter((e) => e),
      resultUrl: listStatusExpired ? null : listAnalysisStatus.s3URL || null,
      creationDate: listStatusExpired ? null : listAnalysisStatus.updateTime,
      expirationDate: listStatusExpired ? null : listAnalysisStatus.expirationTime || null,
    };

    //Verify if has error for status equals inactive
    if (
      analysisStatus.status === getListStatusString(listStatus.Inactive) &&
      analysisStatus.errorsDetails.length === 0
    ) {
      analysisStatus.errorsDetails.push(analysisStatus.status);
      analysisStatus.status = 'Error';
    }

    return analysisStatus;
  }

  async getAnalysisStatusWithErrorFileStoragePath({
    analysisId,
    listId,
    organizationId,
  }: {
    organizationId: number;
    listId: number;
    analysisId: string;
  }): Promise<ListAnalysisResponse> {
    const analysisStatus = await this.getAnalysisStatus({
      analysisId,
      listId,
      organizationId,
    });
    // If the analysis status is Draft, get the list details to get the error file storage path if it exists
    if (analysisStatus.status === getListStatusString(listStatus.Draft)) {
      // Get the list details to get the error file storage path if it exists
      const list = await this.listService.getList({
        analysisId,
        listId,
        organizationId,
      });
      if (list) {
        // Add the error file storage path to the errorsDetails array
        if (list.errorFileStoragePath) {
          analysisStatus.errorsDetails.push(list.errorFileStoragePath);
        }
      }
    }
    return analysisStatus;
  }
  async prepareUpload({
    organizationId,
    organization_user_id,
    fileType,
  }: PrepareUploadRequestSchema & { organizationId: number; organization_user_id: number }) {
    const fileKey = generateRandomFilename(fileType);
    try {
      const presignedURLResponse = await axios.post<{
        url: string;
        keyFile: string;
        fileS3Route: string;
      }>(`${this.LLP_BASE_URL}/api/create-presigned-url`, {
        key: fileKey,
        contentType: contentType[fileType],
      });
      const { url, keyFile } = presignedURLResponse.data;

      const connection = await this.getOrganizationConnection(organizationId);
      const externalUploadRepository = connection.getRepository(ExternalUpload);

      const externalUpload = new ExternalUpload();
      externalUpload.userId = organization_user_id;
      externalUpload.uploadKeyFile = keyFile;
      externalUpload.uploadUrl = url;
      externalUpload.uploadDateTime = new Date();

      const newExternalUploadObject = await externalUploadRepository.save(externalUpload);
      return transformExternalUpload(newExternalUploadObject);
    } catch (error) {
      this.logger.error('prepareUpload error', error, error?.response?.data);
      throw error;
    }
  }

  private async getOrganizationConnection(organizationId: number) {
    const organization = await this.getOrganizationDetails(organizationId);
    const connection = await this.createOrganizationConnection(organization);
    return connection;
  }

  private async getOrganizationDetails(organizationId: number) {
    const organization = await this.organizationService.findOrganizationById(organizationId);
    return organization;
  }

  private async createOrganizationConnection(organization: Organization) {
    const connection = await this.clientStoreConnection.getConnection(organization.organizationDb);
    return connection;
  }

  private async checkIfS3FileExists(fileKey: string) {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
      },
      region: this.AWS_REGION,
    });

    const bucketName = this.LARGE_PROCESING_LIST_BUCKET;

    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    let contentLength = 0;

    try {
      const obj = new GetObjectCommand(params);
      const response = await s3.send(obj);
      contentLength = response?.ContentLength;
    } catch (error) {
      throwCustomErrorResponse('File not found', HttpStatus.FORBIDDEN);
    }

    if (contentLength < MIN_FILE_SIZE_IN_BYTES) {
      throwCustomErrorResponse('File is empty', HttpStatus.FORBIDDEN);
    }
  }

  async uploadNewList(
    newListDetails: ListUploadNewRequestSchema,
    organizationId: number
  ): Promise<ListUploadNewResponse | ListUploadNewErrorResponse> {
    const organizationDetails = await this.getOrganizationDetails(organizationId);
    const organizationConnection = await this.createOrganizationConnection(organizationDetails);
    const externalUploadRepository = organizationConnection.getRepository(ExternalUpload);

    const externalUpload = await externalUploadRepository.findOne({
      where: { id: parseInt(newListDetails.uploadId) },
    });

    if (!externalUpload) {
      throwCustomErrorResponse(
        'Failed to process the request, upload id not found',
        HttpStatus.BAD_REQUEST
      );
    }

    await this.checkIfS3FileExists(externalUpload.uploadKeyFile);

    let largeListCreated: {
      data: { list_id: number };
    };
    try {
      largeListCreated = await axios.post(`${this.LLP_BASE_URL}/api/create-large-list`, {
        list_name: newListDetails.listName,
        user_id: externalUpload.userId,
        client_database: organizationDetails.organizationDb,
        analysisIds: newListDetails.analysisIDs,
      });
    } catch (error) {
      if (error?.response?.status === HttpStatus.BAD_REQUEST) {
        throwCustomErrorResponse(error.response?.data?.message, HttpStatus.BAD_REQUEST);
      }

      this.logger.error('create large list internal error');
      throwCustomErrorResponse('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const listId = largeListCreated.data.list_id;

    // save list to process
    const saveListToProcess = await axios.post<{
      list_id: number;
      s3_location: string;
    }>(`${this.LLP_BASE_URL}/api/save-list-to-process`, {
      userId: externalUpload.userId,
      list_id: listId,
      key: externalUpload.uploadKeyFile,
      listName: newListDetails.listName,
      client_database: organizationDetails.organizationDb,
    });

    // process list
    const processListResponse = await axios.post<{
      executionArn: string;
      startDate: string;
    }>(`${this.LLP_BASE_URL}/api/process-list`, {
      organization_id: organizationDetails.id,
      list_id: listId,
      organization_database: organizationDetails.organizationDb,
      subscription_status_id: organizationDetails.subscriptionStatusId,
      path: saveListToProcess.data.s3_location,
      template_type: newListDetails.templateId,
      user_id: externalUpload.userId,
      startAnalysis: true,
      isExternalAPIProcess: true,
    });

    this.logger.log('Event analysis response: ', processListResponse.data);

    const response: ListUploadNewResponse = {
      uploadId: newListDetails.uploadId,
      listId: listId.toString(),
      status: LIST_INITIAL_STATUS,
      errorDetails: '',
      creationDate: new Date(processListResponse.data.startDate),
    };

    return response;
  }

  async generateAlert({
    startDate,
    endDate,
    organizationId,
    listId,
  }: AlertsGenerateBodySchema & { organizationId: number; listId: number }) {
    const organization = await this.getOrganizationDetails(organizationId);

    const sqsMessage = generateAlertsSqsTemplate({
      startDate,
      listId,
      organization,
      endDate,
    });

    await this.sqsService.send(AWS_DOWNLOADER_QUEUE_IDENTIFIER, {
      id: 'dl' + listId,
      body: sqsMessage,
      messageAttributes: sqsMessage,
      delaySeconds: 0,
      groupId: 'default',
    });
  }
  async deleteList(listId: number, organizationId: number, userEmail: string): Promise<boolean> {
    try {
      const connection = await this.getOrganizationConnection(organizationId);
      const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
      const listAnalysisStatus = await listAnalysisStatusRepository.findOne({
        where: { listId },
      });
      if (listAnalysisStatus) {
        const user = await this.userService.findUser(organizationId, userEmail);

        const result = await axios.post(
          `${this.LLP_BASE_URL}/api/list/${listId}/delete`,
          {
            organization_user_id: user.organization_user_id,
            userEmail: userEmail,
            organizationDatabase: connection.options.database,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        return !!result;
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      this.logger.warn('DeleteList failed', error);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }
}
