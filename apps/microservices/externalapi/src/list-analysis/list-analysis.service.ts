import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { AnalysesGenerateRequest, ListAnalysisResponse } from './list-analysis.dto';
import { UserService } from './user.service';

import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { featureFlagsService, generateRandomFilename } from '@wri-monorepos/shared';
import { OrganizationService } from './organization.service';
import { transformExternalUpload } from './transformers';
import {
  ListUploadNewErrorResponse,
  ListUploadNewRequestSchema,
  ListUploadNewResponse,
  PrepareUploadRequestSchema,
} from './list-upload-new.dto';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { throwCustomErrorResponse } from './utils/throw-custom-error-response';
import {
  deduceActiveId,
  getListStatusString,
  ListActivityTypesEnum,
  listStatus,
} from '@wri-monorepos/constants';
import {
  CREATE_ANALYSIS,
  DELETE_LIST,
  GENERATE_ANALYSIS,
  LIST_ANALISYS_ENDPOINT_NAMES,
  PREPARE_UPLOAD,
  UPLOAD_NEW_LIST,
} from '../config';
import { generateAnalysisTemplate } from '../shared/generate-templates';
import { ListService } from '../lists/lists.service';
import { ServerConfigType } from '../validators/server-config';
import { SaveActivityLogEndpoint } from './utils/saveActivityLogEndpoint';
import { handleCreateAnalysis } from '@wri-monorepos/geo';
import { EntitySchema, Raw } from 'typeorm';
import {
  ListSchema,
  ListSchemaType,
  ClientStoreConnection,
  ListsAnalysisStatus,
  ExternalUpload,
  SQLUtils,
  GHGAnalysisDataByListId,
  getGHGLocationErrorsByListId,
  FeatureFlag,
  Organization,
  Lists,
} from '@wri-monorepos/sql';
import * as sql from 'mssql';

const LIST_INITIAL_STATUS = 'Pending';
const MIN_FILE_SIZE_IN_BYTES = 70; // single location CSV file size

const contentType = {
  csv: 'text/csv',
  kml: 'application/vnd.google-earth.kml+xml',
  kmz: 'application/vnd.google-earth.kmz',
  xls: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/x-zip-compressed',
  geojson: 'application/json',
  json: 'application/json',
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
    private organizationService: OrganizationService,
    private readonly listService: ListService,
    private readonly saveActivityLogEndpoint: SaveActivityLogEndpoint
  ) {
    this.LLP_BASE_URL = configService.get('LLP_BASE_URL');
    this.awsConfig = {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      region: this.configService.get('AWS_REGION'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      largeProcessingListBucket: this.configService.get('LARGE_PROCESSING_LIST_BUCKET'),
    };

    // Axios trace interceptor is now configured globally in main.ts
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

  async getLocationsErrors({
    listId,
    organizationId,
    analysisId,
  }: {
    listId: number;
    organizationId: number;
    analysisId?: string;
  }): Promise<Array<{ ['Location Name']: string; Details: string }>> {
    try {
      const organization = await this.organizationService.findOrganizationById(organizationId);
      if (!organization) {
        throw new HttpException({ errorDetails: 'Organization not found' }, HttpStatus.NOT_FOUND);
      }

      const list = await this.listService.getList({
        listId,
        organizationId,
      });

      if (!list) {
        throw new HttpException({ errorDetails: 'List not found' }, HttpStatus.NOT_FOUND);
      }

      const listTable = list.listTableName;

      const ListEntity = new EntitySchema<ListSchemaType>({
        ...ListSchema,
        name: listTable,
      });

      const connection = await this.clientStoreConnection.getConnection(
        organization.organizationDb,
        [ListEntity]
      );
      const listTableNameRepository = connection.getRepository(ListEntity);
      const locationsWithErrors = await listTableNameRepository.find({
        select: ['locationName', 'errorDetails'],
        where: {
          errorDetails: Raw((alias) => `${alias} IS NOT NULL AND ${alias} != ''`),
        },
      });
      let ghgLocationErrors = [];
      if (analysisId === 'GHG') {
        // Get GHG location errors
        ghgLocationErrors = await this.getGhgLocationErrors(listId, organization.organizationDb);

        // We would have a problem if there are overlaps for errors already reported in locationWithErrors and new errors being added by ghgLocationErrors.
        if (ghgLocationErrors.length > 0) {
          locationsWithErrors.push(...ghgLocationErrors);
        }
      }

      return locationsWithErrors.map((location) => ({
        'Location Name': location.locationName,
        Details: location.errorDetails,
      }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { errorDetails: error.message || 'Failed to retrieve list errors' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async prepareUpload({
    organizationId,
    organization_user_id,
    fileType,
  }: PrepareUploadRequestSchema & { organizationId: number; organization_user_id: number }) {
    //Save ActivityLog
    const organizationDetails = await this.getOrganizationDetails(organizationId);

    await this.saveActivityLogEndpoint.saveActivityLogEndpoint(
      organizationDetails,
      organization_user_id,
      LIST_ANALISYS_ENDPOINT_NAMES[PREPARE_UPLOAD],
      ListActivityTypesEnum.ListPrepareUpload
    );

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

    try {
      if (await searchForFeatureFlag(organizationDetails.organizationDb, 'UploadListLp')) {
        if (typeof newListDetails.commodity === 'undefined') {
          throwCustomErrorResponse('Missing Commodity value', HttpStatus.BAD_REQUEST);
        }
      } else {
        newListDetails.commodity = 'Unknown';
      }
    } catch (error) {
      return error;
    }

    const externalUpload = await externalUploadRepository.findOne({
      where: { id: parseInt(newListDetails.uploadId) },
    });
    await this.saveActivityLogEndpoint.saveActivityLogEndpoint(
      organizationDetails,
      externalUpload.userId,
      LIST_ANALISYS_ENDPOINT_NAMES[UPLOAD_NEW_LIST],
      ListActivityTypesEnum.ListCreated
    );

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
      const data = {
        list_name: newListDetails.listName,
        user_id: externalUpload.userId,
        client_database: organizationDetails.organizationDb,
        analysisIds: newListDetails.analysisIDs,
        commodity: newListDetails.commodity,
      };
      largeListCreated = await axios.post(`${this.LLP_BASE_URL}/api/create-large-list`, data);
    } catch (error) {
      if (error?.response?.status === HttpStatus.BAD_REQUEST) {
        throwCustomErrorResponse(error.response?.data?.message, HttpStatus.BAD_REQUEST);
      }

      this.logger.error('create large list internal error', error.response?.data || error.stack);
      throwCustomErrorResponse('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const listId = largeListCreated.data.list_id;
    if (!listId) {
      this.logger.error('List ID not found from create-large-list');
      throwCustomErrorResponse('List ID not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

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
        list_name: newListDetails.listName,
        analysisIds: newListDetails.analysisIDs,
        commodity: newListDetails.commodity || '', // commodity still not required in EAPI
        // Forcing template_type because only cocoa_generic is supported
        // LP verifies the field is a string
        template_type: 'cocoa_generic',
        template_id: deduceActiveId['cocoaGeneric'],
        user_id: externalUpload.userId,
        startAnalysis: true,
        isExternalAPIProcess: true,
        saveAsDraft: false,
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
      throwCustomErrorResponse(
        'UploadNew: Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateDownloadBundle({
    startDate,
    endDate,
    organizationId,
    listId,
    userEmail,
    analysisId,
    outputType,
  }: AnalysesGenerateRequest) {
    const organization = await this.getOrganizationDetails(organizationId);
    const user = await this.userService.findUser(organizationId, userEmail);
    await this.saveActivityLogEndpoint.saveActivityLogEndpoint(
      organization,
      user.organization_user_id,
      LIST_ANALISYS_ENDPOINT_NAMES[GENERATE_ANALYSIS],
      ListActivityTypesEnum.ListGenerate
    );

    const list = await this.listService.getList({
      listId,
      organizationId,
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const connection = await this.getOrganizationConnection(organizationId);
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
    const listAnalysisStatus = await listAnalysisStatusRepository.findOne({
      where: { listId, analysisId },
    });

    if (!listAnalysisStatus) {
      throw new NotFoundException('Analysis status not found');
    }

    if (listAnalysisStatus.status !== listStatus.Active) {
      throw new BadRequestException('List is not active');
    }

    let message = {};
    try {
      if (!userEmail) {
        throw new BadRequestException('Missing user email');
      }
      if (analysisId === 'ALERTS') {
        if (!startDate || !endDate) {
          throw new BadRequestException('Missing start date or end date');
        }
        message = generateAnalysisTemplate({
          startDate,
          listId,
          organization,
          endDate,
          analysisId,
        });
      } else {
        message = generateAnalysisTemplate({
          listId,
          analysisId,
          organization,
        });
      }
      // Not send email for AFI VC
      if (outputType && analysisId === 'AFI') {
        message = {
          ...message,
          type: 'afiVC',
          file: 'shapefile',
        };
      }

      await axios.post(
        `${this.configService.get<string>('LD_MICROSERVICE_URL')}/list/download`,
        message
      );
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
    //Save ActivityLog
    const organizationDetails = await this.getOrganizationDetails(organizationId);
    const user = await this.userService.findUser(organizationId, userEmail);
    await this.saveActivityLogEndpoint.saveActivityLogEndpoint(
      organizationDetails,
      user.organization_user_id,
      LIST_ANALISYS_ENDPOINT_NAMES[DELETE_LIST],
      ListActivityTypesEnum.ListDeleted
    );
    try {
      const connection = await this.getOrganizationConnection(organizationId);
      const listsRepository = connection.getRepository(Lists);
      const listFound = await listsRepository.findOne({
        where: { id: listId },
      });
      if (listFound) {
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
    analysisId: string,
    listId: number,
    organizationId: number,
    userEmail: string,
    organization_user_id: number
  ) {
    const organizationDetails = await this.getOrganizationDetails(organizationId);

    await this.saveActivityLogEndpoint.saveActivityLogEndpoint(
      organizationDetails,
      organization_user_id,
      LIST_ANALISYS_ENDPOINT_NAMES[CREATE_ANALYSIS],
      ListActivityTypesEnum.ListAnalyzing
    );
    const isFromEAPI = true;
    const response = await handleCreateAnalysis(
      analysisId.toUpperCase(),
      listId,
      organizationId,
      organizationDetails.organizationDb,
      userEmail ? true : false,
      organization_user_id,
      organizationDetails.subscriptionStatusId,
      true,
      isFromEAPI
    );

    return response;
  }
  async getGhgLocationErrors(
    listId: number,
    clientDatabase: string
  ): Promise<Array<{ locationName: string; errorDetails: string }>> {
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];

    const data = await SQLUtils.queryDB<GHGAnalysisDataByListId[]>(
      clientDatabase,
      getGHGLocationErrorsByListId,
      parameters
    );
    if (data) {
      return data.reduce((errors, item) => {
        if (item.locationError) {
          errors.push({
            locationName: item.locationName,
            errorDetails: item.locationError,
          });
        }
        return errors;
      }, []);
    } else {
      return [];
    }
  }
}
async function searchForFeatureFlag(clientDatabase: string, flagName: string): Promise<boolean> {
  const { getFeatureFlagsForCurrentOrg, getClientIdByClientStoreDatabaseName } =
    await featureFlagsService();
  const orgId = await getClientIdByClientStoreDatabaseName(clientDatabase);
  const flags = await getFeatureFlagsForCurrentOrg(orgId);

  const uploadListLpFlag = flags.find((f) => f.flagId === flagName) as FeatureFlag;
  return uploadListLpFlag?.flagState;
}
