import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
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
  ListUploadNewRequest,
  ListUploadNewResponse,
} from './list-upload-new.dto';
import { Organization } from '../api-keys/organization.entity';
import { S3 } from 'aws-sdk';

const DEFAULT_ANALYSIS = 'FCD';
const LIST_INITIAL_STATUS = 'Pending';
const MIN_FILE_SIZE_IN_BYTES = 500;
@Injectable()
export class ListAnalysisService {
  private readonly LLP_BASE_URL: string;

  constructor(
    private config: ConfigService,
    private userService: UserService,
    private clientStoreConnection: ClientStoreConnection,
    private organizationService: OrganizationService
  ) {
    this.LLP_BASE_URL = this.config.get<string>('LLP_BASE_URL');
  }

  // Replace this with actual database or external service calls
  async getAnalysisStatus(organizationId: number, listID: number): Promise<ListAnalysisResponse> {
    const connection = await this.getOrganizationConnection(organizationId);
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
    const listAnalysisStatus = await listAnalysisStatusRepository.findOne({
      where: { listId: listID, analysisId: DEFAULT_ANALYSIS },
    });

    // Waiting for changes from Gustavo and Dakota on tickets 2353 and 2354
    const analysisStatus: ListAnalysisResponse = {
      listId: listAnalysisStatus.listId.toString(),
      status: 'Completed',
      errorsDetails: (listAnalysisStatus.errorInfo || '').split('\n').filter((e) => e),
      resultUrl: listAnalysisStatus.listId ? 'https://example.com/results' : null,
      creationDate: listAnalysisStatus.updateTime,
      expirationDate: new Date(), // this should be updated after Gustavo save the data in database
    };

    return analysisStatus;
  }

  async prepareUpload(userEmail: string) {
    const user = await this.userService.findUser(userEmail);
    if (!user) {
      throw new NotFoundException(`User with ${userEmail} not found`);
    }

    const fileKey = generateRandomFilename('csv');
    const presignedURLResponse = await axios.post<{
      url: string;
      keyFile: string;
      fileS3Route: string;
    }>(`${this.LLP_BASE_URL}/api/create-presigned-url`, { key: fileKey, contentType: 'text/csv' });
    const { url, keyFile } = presignedURLResponse.data;

    const connection = await this.getOrganizationConnection(user.organization_id);
    const externalUploadRepository = connection.getRepository(ExternalUpload);

    const externalUpload = new ExternalUpload();
    externalUpload.userId = user.id;
    externalUpload.uploadKeyFile = keyFile;
    externalUpload.uploadUrl = url;
    externalUpload.uploadDateTime = new Date();

    const newExternalUploadObject = await externalUploadRepository.save(externalUpload);
    return transformExternalUpload(newExternalUploadObject);
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
    const s3 = new S3({
      signatureVersion: 'v4',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });

    const bucketName = process.env.LARGE_PROCESING_LIST_BUCKET;

    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    let contentLength = 0;

    try {
      const response = await s3.headObject(params).promise();
      contentLength = response?.ContentLength;
    } catch (error) {
      const errorDescription = new ListUploadNewErrorResponse();
      errorDescription.errorDetails = 'File not found';
      throw new HttpException(errorDescription, HttpStatus.FORBIDDEN);
    }

    if (contentLength < MIN_FILE_SIZE_IN_BYTES) {
      const errorDescription = new ListUploadNewErrorResponse();
      errorDescription.errorDetails = 'File is empty';
      throw new HttpException(errorDescription, HttpStatus.FORBIDDEN);
    }
  }

  async uploadNewList(
    newListDetails: ListUploadNewRequest,
    organizationId: number
  ): Promise<ListUploadNewResponse | ListUploadNewErrorResponse> {
    const organizationDetails = await this.getOrganizationDetails(organizationId);
    const organizationConnection = await this.createOrganizationConnection(organizationDetails);
    const externalUploadRepository = organizationConnection.getRepository(ExternalUpload);

    const externalUpload = await externalUploadRepository.findOne({
      where: { id: parseInt(newListDetails.uploadId) },
    });

    if (!externalUpload) {
      const errorDescription = new ListUploadNewErrorResponse();
      errorDescription.errorDetails = 'Failed to process the request, upload id not found';
      throw new HttpException(errorDescription, HttpStatus.BAD_REQUEST);
    }

    await this.checkIfS3FileExists(externalUpload.uploadKeyFile);

    // create large list process
    const largeListCreated = await axios.post<{
      list_id: number;
    }>(`${this.LLP_BASE_URL}/api/create-large-list`, {
      list_name: newListDetails.listName,
      user_id: externalUpload.userId,
      client_database: organizationDetails.organizationDb,
      analysisIds: [],
    });

    // save list to process
    const saveListToProcess = await axios.post<{
      list_id: number;
      s3_location: string;
    }>(`${this.LLP_BASE_URL}/api/save-list-to-process`, {
      userId: externalUpload.userId,
      list_id: largeListCreated.data.list_id,
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
      list_id: largeListCreated.data.list_id,
      path: saveListToProcess.data.s3_location,
      template_type: newListDetails.templateId,
      user_id: externalUpload.userId,
      startAnalysis: true,
    });

    Logger.log('Event analysis response: ', processListResponse.data);

    const response: ListUploadNewResponse = {
      uploadId: newListDetails.uploadId,
      listId: largeListCreated.data.list_id.toString(),
      status: LIST_INITIAL_STATUS,
      errorDetails: '',
      creationDate: new Date(processListResponse.data.startDate),
    };

    return response;
  }
}
