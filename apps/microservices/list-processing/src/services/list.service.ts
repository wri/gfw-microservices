import { ClientStoreConnection, FeatureFlag, SQLUtils } from '@wri-monorepos/sql';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CreateListRequest, RequestLargeListProcess, ResponseLargeListProcess } from '../models';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { RequestSaveLargeListProcessModel, CreateListInsertResultModel } from '../models';
import { MetadataService as AWSMetadataService } from '@wri-monorepos/aws';
import { ServerConfigType } from '../validators/server-config';
import { featureFlagsService } from '@wri-monorepos/shared';
import { DeprecatedStartAnalysisService } from '../app/list-upload/deprecated.start.analysis.service';
import { updateListsUploadStatus } from '../app/list-upload/shared/update.lists.upload.status';
import { StartAnalysisService } from '../app/list-upload/start.analysis.service';
import { DeprecatedCreateLargeListService } from '../app/list-upload/deprecated.create.large.list.service';
import { CreateLargeListService } from '../app/list-upload/create.large.list.service';

type ListRequest = {
  listName: string;
  userId: number;
  clientDatabase: string;
  analysisIds: string[];
  templateId?: number;
  gfwListId?: number | null;
  isUploadListLpEnabled?: boolean;
  commodity?: string;
  saveAsDraft: boolean;
} & Partial<CreateListRequest>;

interface CreateListResult {
  list_id: number;
}

@Injectable()
export class ListService {
  constructor(
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly awsMetadataService: AWSMetadataService,
    private readonly config: ConfigService<ServerConfigType, true>,
    private readonly deprecatedStartAnalysisService: DeprecatedStartAnalysisService,
    private readonly startAnalysisService: StartAnalysisService,
    private readonly deprecatedCreateLargeListService: DeprecatedCreateLargeListService,
    private readonly createLargeListService: CreateLargeListService
  ) {}

  async createNewList(createListRequest: CreateListRequest) {
    try {
      const listTable = await this.createListTables({
        listName: createListRequest.listName,
        userId: createListRequest.userId,
        clientDatabase: createListRequest.clientDatabase,
        analysisIds: createListRequest.analysisIds,
        isUploadListLpEnabled: createListRequest.isUploadListLpEnabled,
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
    const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
    const flags = await getFeatureFlagsForCurrentOrg(request.organization_id);

    const uploadListLpFlag = flags.find((f) => f.flagId === 'UploadListLp') as FeatureFlag;

    if (uploadListLpFlag.flagState) {
      const bucket = this.config.get('LARGE_PROCESSING_LIST_BUCKET', { infer: true });
      request.path = request.path.replace(`s3://${bucket}/`, '');
      return this.startAnalysisService.run(request);
    }
    return this.deprecatedStartAnalysisService.run(request);
  }

  async createListTables(request: ListRequest): Promise<CreateListResult> {
    const { isUploadListLpEnabled } = request;
    if (isUploadListLpEnabled) {
      return await this.createLargeListService.run(request);
    }
    return await this.deprecatedCreateLargeListService.run(request);
  }

  /**
   * @param name Save list to process
   * @returns
   */
  async saveListToProcess(
    listDetails: RequestSaveLargeListProcessModel
  ): Promise<CreateListInsertResultModel> {
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
