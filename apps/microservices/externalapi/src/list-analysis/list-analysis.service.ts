import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AnalysesGenerateRequest, ListAnalysisResponse } from './list-analysis.dto';
import { UserService } from './user.service';
import { ExternalUpload } from './external-upload.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { checkProcessingLimits, generateRandomFilename } from '@wri-monorepos/shared';
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
import { analysisTypesOptions, getListStatusString, listStatus } from '@wri-monorepos/constants';
import { SqsService } from '@ssut/nestjs-sqs';
import { AWS_DOWNLOADER_QUEUE_IDENTIFIER } from '../config';
import { generateAnalysisSqsTemplate } from '../shared/generate-sqs-templates';
import { ListService } from '../lists/lists.service';
import { extractAnalysisTypes, getListAnalysisStatus } from '@wri-monorepos/geo';
import {
  ActivityLog,
  updateListsAnalysisStatus,
  ClientStoreConnection as ClientStoreConnectionLibSql,
  Lists,
} from '@wri-monorepos/sql';
import { ServerConfigType } from '../validators/server-config';

import {
  GEO_TRELLIS__ANALYZE_LIST_DEV,
  GEO_TRELLIS__ANALYZE_LIST_QA,
  GEO_TRELLIS__ANALYZE_LIST_STAGING,
  GEO_TRELLIS__ANALYZE_LIST_PROD,
  GEO_TRELLIS__ANALYZE_LIST_PRODV2,
} from './utils/geoTrellis.config';

import { EmailService } from '@wri-monorepos/aws';

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
  private readonly awsConfig: {
    accessKeyId: string;
    region: string;
    secretAccessKey: string;
    largeProcessingListBucket: string;
  };
  private readonly logger = new Logger(ListAnalysisResponse.name);

  constructor(
    private configService: ConfigService<ServerConfigType, true>,
    private userService: UserService,
    private clientStoreConnection: ClientStoreConnection,
    private clientStoreConnectionLibSql: ClientStoreConnectionLibSql,
    private organizationService: OrganizationService,
    private readonly sqsService: SqsService,
    private readonly listService: ListService
  ) {
    this.LLP_BASE_URL = configService.get('LLP_BASE_URL');
    this.awsConfig = {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      region: this.configService.get('AWS_REGION'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      largeProcessingListBucket: this.configService.get('LARGE_PROCESSING_LIST_BUCKET'),
    };
  }

  @Inject(EmailService)
  private readonly emailService: EmailService;

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
      creationDate: listStatusExpired ? null : listAnalysisStatus.bundleCreationTime || null,
      expirationDate: listStatusExpired ? null : listAnalysisStatus.expirationTime || null,
    };

    //Verify if has error for status equals inactive
    if (analysisStatus.status === getListStatusString(listStatus.Inactive)) {
      if (analysisStatus.errorsDetails.length === 0) {
        analysisStatus.errorsDetails.push(analysisStatus.status);
      }
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
          analysisStatus.status = 'Error';
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
        accessKeyId: this.awsConfig.accessKeyId,
        secretAccessKey: this.awsConfig.secretAccessKey,
      },
      region: this.awsConfig.region,
    });

    const bucketName = this.awsConfig.largeProcessingListBucket;

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
      throwCustomErrorResponse('File not found', HttpStatus.NOT_FOUND);
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

      this.logger.error('create large list internal error', error);
      throwCustomErrorResponse('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const listId = largeListCreated.data.list_id;

    try {
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
        // Forcing template_type because only cocoa_generic is supported
        // LP verifies the field is a string
        template_type: 'cocoa_generic',
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
    } catch (error) {
      // axios returns useful info in error.response.data
      this.logger.error('UploadNew error', error?.response?.data || error);
      throw error;
    }
  }

  async generateDownloadBundle({
    startDate,
    endDate,
    organizationId,
    listId,
    userEmail,
    analysisId,
  }: AnalysesGenerateRequest) {
    const organization = await this.getOrganizationDetails(organizationId);

    let sqsMessage = {};
    try {
      if (!userEmail) {
        throw new BadRequestException('Missing user email');
      }
      if (analysisId === 'ALERTS') {
        if (!startDate || !endDate) {
          throw new BadRequestException('Missing start date or end date');
        }
        sqsMessage = generateAnalysisSqsTemplate({
          startDate,
          listId,
          organization,
          endDate,
          analysisId,
        });
      } else {
        sqsMessage = generateAnalysisSqsTemplate({
          listId,
          analysisId,
          organization,
        });
      }

      await this.sqsService.send(AWS_DOWNLOADER_QUEUE_IDENTIFIER, {
        id: 'dl' + listId,
        body: sqsMessage,
        messageAttributes: sqsMessage,
        delaySeconds: 0,
        groupId: 'default',
      });
    } catch (error) {
      this.logger.error('generateDownloadBundle error', error);
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async deleteList(listId: number, organizationId: number, userEmail: string): Promise<string> {
    try {
      const connection = await this.getOrganizationConnection(organizationId);
      const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
      const listAnalysisStatus = await listAnalysisStatusRepository.findOne({
        where: { listId },
      });
      if (listAnalysisStatus) {
        const user = await this.userService.findUser(organizationId, userEmail);

        const { data } = await axios.post(
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
        return data;
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
  async createAnalysis(
    analysisTypesToProcess: string,
    listId: number,
    reanalyze: boolean,
    organizationId: number,
    userEmail: string,
    organization_user_id: number
  ) {
    const geoTrellisUrlsByEnv = {
      qa: GEO_TRELLIS__ANALYZE_LIST_QA,
      staging: GEO_TRELLIS__ANALYZE_LIST_STAGING,
      production: GEO_TRELLIS__ANALYZE_LIST_PROD,
      ProdV2: GEO_TRELLIS__ANALYZE_LIST_PRODV2,
      default: GEO_TRELLIS__ANALYZE_LIST_DEV,
    };

    const organizationDetails = await this.getOrganizationDetails(organizationId);
    const url = geoTrellisUrlsByEnv[process.env.NODE_ENV] || geoTrellisUrlsByEnv.default;

    const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
      organizationDb: organizationDetails.organizationDb,
      organizationId,
      subscriptionStatusId: organizationDetails.subscriptionStatusId,
      listId: listId,
    });
    const connection = await this.clientStoreConnection.getConnection(
      organizationDetails.organizationDb
    );
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);

    const listToUpdate = await listAnalysisStatusRepository.findBy({
      listId,
      analysisId: analysisTypesToProcess,
    });

    if (listToUpdate.length === 0) {
      await listAnalysisStatusRepository.save({
        listId: listId,
        analysisId: analysisTypesToProcess,
        status: listStatus.Pending,
        updateTime: new Date(),
      });
    } else {
      await listAnalysisStatusRepository.update(
        { listId, analysisId: analysisTypesToProcess },
        {
          status: listStatus.Pending,
        }
      );
    }

    const listAnalysisStatusData = await getListAnalysisStatus(
      organizationDetails.organizationDb,
      listId
    );

    const analysiTypes = extractAnalysisTypes(
      analysisTypesToProcess
        ? listAnalysisStatusData.filter(({ analysisId }) =>
            analysisTypesToProcess.includes(analysisId)
          )
        : listAnalysisStatusData
    );

    if (isListLocationOverLimit) {
      await updateListsAnalysisStatus(organizationDetails.organizationDb, {
        listId: listId,
        errorInfo: 'Exceeded Analysis Limit',
        status: listStatus.Inactive,
      });
      throw new Error(`Analysis limit reached`);
    }
    const data = {
      list_id: listId,
      user_id: organization_user_id,
      organization_id: organizationId,
      reanalyze,
      processing_limit: processingLimit,
      analysis_types: analysiTypes,
    };
    const connectionLibSql = await this.clientStoreConnectionLibSql.getConnection(
      organizationDetails.organizationDb
    );

    const activityLogRepository = connectionLibSql.getRepository(ActivityLog);
    const response = await axios({
      method: 'post',
      url: url,
      data: data,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    try {
      await listAnalysisStatusRepository.update(
        { listId, analysisId: analysisTypesToProcess },
        {
          s3URL: null,
          bundleCreationTime: null,
          expirationTime: null,
          errorInfo: null,
        }
      );
    } catch (error) {
      this.logger.error(
        'createAnalysis',
        `Error when updating ${listId} to analysis: ${error.message}`
      );
      return error.message;
    }
    try {
      await activityLogRepository.save({
        userId: organization_user_id,
        activityTypeId: 22,
        activityDescription: `ListAnalyzing ${listId} has been sent to analysis`,
        activityTime: new Date(),
      });

      //  In order for that to work, the new analyze route should clear out stale s3_url, creation, and expiration fields in ListsAnalysisStatus table.

      const enabledAnalyses = analysisTypesOptions.filter((analysis) => analysiTypes[analysis.id]);

      const subject = `${enabledAnalyses
        .map((analysis) => analysis.shortLabel)
        .join(', ')} calculations are processing for the GFW Pro list ${listId} `;

      // Get Listname
      const listRepository = connectionLibSql.getRepository(Lists);
      const { listName } = await listRepository.findOneBy({
        id: listId,
      });

      await this.emailService.sendEmail(
        process.env.SES_SENDER_EMAIL,
        [userEmail],
        subject,
        'start',
        { listName }
      );
    } catch (error) {
      this.logger.error(
        'createAnalysis',
        `Error when updating ${listId} to analysis: ${error.message}`
      );
      return error.message;
    }
    return response.statusText;
  }
}
