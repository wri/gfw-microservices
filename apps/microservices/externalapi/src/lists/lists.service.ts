import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationService } from '../list-analysis/organization.service';
import { S3Service } from '@wri-monorepos/aws';
import { ListInfoResponse } from '../list-analysis/list-upload-new.dto';
import {
  ClientStoreConnection,
  Lists,
  ListsAnalysisStatus,
  Organization,
} from '@wri-monorepos/sql';
import { In } from 'typeorm';

@Injectable()
export class ListService {
  public readonly logger = new Logger(ListService.name);
  constructor(
    private clientStoreConnection: ClientStoreConnection,
    private organizationService: OrganizationService,
    private s3Service: S3Service
  ) {}
  // Replace this with actual database or external service calls
  async getList({
    listId,
    organizationId,
  }: {
    organizationId: number;
    listId: number;
  }): Promise<Lists> {
    try {
      const connection = await this.getOrganizationConnection(organizationId);
      const listRepository = connection.getRepository(Lists);
      const listStatus = await listRepository.findOneBy({
        id: listId,
      });

      // If list not found, return null
      if (!listStatus) {
        this.logger.error('List status not found.');
        return null;
      }
      // There is some trash in DevCo db that has the errorFileStoragePath as 'none' so we need to check if it is different from 'none'
      try {
        if (listStatus.errorFileStoragePath && listStatus.errorFileStoragePath.includes('s3://')) {
          const s3Path = listStatus.errorFileStoragePath.split('s3://').pop();
          const [bucket, ...keyParts] = s3Path.split('/');
          const key = keyParts.join('/');
          listStatus.errorFileStoragePath = await this.getPresignedUrl(key, bucket);
        } else {
          listStatus.errorFileStoragePath = null;
        }
      } catch (error) {
        this.logger.error('Error getting presigned url', error.stack || error);
        listStatus.errorFileStoragePath = 'Error getting presigned url';
      }
      return listStatus;
    } catch (error) {
      this.logger.error('List status not found.', error.stack || error);
      return null;
    }
  }

  private async createOrganizationConnection(organization: Organization) {
    const connection = await this.clientStoreConnection.getConnection(organization.organizationDb);
    return connection;
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
  private async getPresignedUrl(key: string, bucket: string): Promise<string> {
    const keyParts = key.split('/');
    const environment = keyParts[0];
    const subPath = keyParts.slice(1, -1).join('/');
    const [filename, extension] = keyParts[keyParts.length - 1].split('.');

    return await this.s3Service.getFileSignedUrlDynamicEnvironment(
      filename,
      extension,
      bucket,
      environment,
      subPath || undefined
    );
  }
  async getListInfo(organizationId: number, listId: number): Promise<ListInfoResponse> {
    try {
      const organization = await this.getOrganizationDetails(organizationId);
      const connection = await this.createOrganizationConnection(organization);
      const listRepository = connection.getRepository(Lists);
      const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);

      const allListAnalysis = await listAnalysisStatusRepository.find({
        where: { listId: listId },
      });
      const listFound = await listRepository.findOne({
        where: { id: listId },
      });
      if (!listFound) {
        throw new NotFoundException(`List ${listId} not found.`);
      }

      // Reverse mapping: DB format -> API format (to match upload_new format)
      const dbToApiFormat: Record<string, string> = {
        ALERTS: 'Alerts',
        FCD: 'FCD',
        AFI: 'DefReport',
        GHG: 'GHG',
      };

      const analysisIds: string[] = [];

      allListAnalysis.forEach((analysis) => {
        const apiFormat = dbToApiFormat[analysis.analysisId] || analysis.analysisId;

        // Handle Weekly Alerts: add "Alerts-Weekly" instead of "Alerts"
        if (analysis.analysisId === 'ALERTS' && analysis.options === 'Weekly') {
          analysisIds.push('Alerts-Weekly');
        } else {
          analysisIds.push(apiFormat);
        }
      });

      const listResponse: ListInfoResponse = {
        listId: listFound.id,
        listName: listFound.listName,
        locationCount: listFound.listLocationsCount,
        analysisIDs: analysisIds.join(','),
      };
      return listResponse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error);
      }
    }
  }
  async getPaginatedListInfo(
    pageSize: number,
    pageNum: number,
    organizationId: number
  ): Promise<ListInfoResponse[]> {
    const take = pageSize === 0 ? 10 : pageSize;
    const skip = pageNum > 0 ? (pageNum - 1) * take : 0;
    try {
      const connection = await this.getOrganizationConnection(organizationId);
      const listRepository = connection.getRepository(Lists);

      const [paginatedList, count] = await listRepository.findAndCount({
        skip,
        take,
        order: {
          id: 'DESC',
        },
      });
      if (!paginatedList.length || !count) {
        this.logger.error('Lists not found.');
        throw new NotFoundException(`pageNum ${pageNum} or pageSize ${pageSize} is out of range`);
      }

      const listIds = paginatedList.map((list) => list.id);

      const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);

      const allListAnalysis = await listAnalysisStatusRepository.find({
        where: { listId: In(listIds) },
      });

      // Reverse mapping: DB format -> API format (to match upload_new format)
      const dbToApiFormat: Record<string, string> = {
        ALERTS: 'Alerts',
        FCD: 'FCD',
        AFI: 'DefReport',
        GHG: 'GHG',
      };

      const analysisIdsByListId = new Map<number, string[]>();

      allListAnalysis.forEach((analysis) => {
        const existingIds = analysisIdsByListId.get(analysis.listId) || [];
        const apiFormat = dbToApiFormat[analysis.analysisId] || analysis.analysisId;

        // Handle Weekly Alerts: add "Alerts-Weekly" instead of "Alerts"
        if (analysis.analysisId === 'ALERTS' && analysis.options === 'Weekly') {
          existingIds.push('Alerts-Weekly');
        } else {
          existingIds.push(apiFormat);
        }

        analysisIdsByListId.set(analysis.listId, existingIds);
      });

      const paginatedListInfo: ListInfoResponse[] = paginatedList.map((list) => ({
        listId: list.id,
        listName: list.listName,
        locationCount: list.listLocationsCount,
        analysisIDs: (analysisIdsByListId.get(list.id) || []).join(','),
      }));

      return paginatedListInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
