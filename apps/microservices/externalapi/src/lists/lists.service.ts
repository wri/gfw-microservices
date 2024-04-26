import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Lists } from './lists.entity';
import { ClientStoreConnection } from '../shared/client-store-connection';
import { OrganizationService } from '../list-analysis/organization.service';
import { Organization } from '../api-keys/organization.entity';
import { S3Service } from '@wri-monorepos/aws';
import { listInfoResponse, paginatedListInfoResponse } from '../list-analysis/list-upload-new.dto';
@Injectable()
export class ListService {
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
    analysisId: string;
  }): Promise<Lists> {
    try {
      const connection = await this.getOrganizationConnection(organizationId);
      const listRepository = connection.getRepository(Lists);
      const listStatus = await listRepository.findOneBy({
        id: listId,
      });

      // If list not found, return null
      if (!listStatus) {
        console.warn('List status not found.');
        return null;
      }
      // There is some trash in DevCo db that has the errorFileStoragePath as 'none' so we need to check if it is different from 'none'
      if (listStatus.errorFileStoragePath && listStatus.errorFileStoragePath.includes('s3://')) {
        listStatus.errorFileStoragePath = await this.getPresignedUrl(
          listStatus.errorFileStoragePath
        );
      } else {
        listStatus.errorFileStoragePath = null;
      }
      return listStatus;
    } catch (e) {
      console.warn('List status not found.', e);
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
  private async getPresignedUrl(fileName: string) {
    const fileUrl = fileName.split('s3://').pop();
    const [bucket, environment, subPath, filenameWithExtensin] = fileUrl.split('/');
    const [filename, extension] = filenameWithExtensin.split('.');

    try {
      return await this.s3Service.getFileSignedUrlDynamicEnvironment(
        filename,
        extension,
        bucket,
        environment,
        subPath
      );
    } catch (error) {
      throw new Error(`[uploadFileToS3] Failed to upload file to bucket. ${error.message}`);
    }
  }
  async getListInfo(organizationId: number, listId: number): Promise<listInfoResponse> {
    try {
      const organization = await this.getOrganizationDetails(organizationId);
      const connection = await this.createOrganizationConnection(organization);
      const listAnalysisStatusRepository = connection.getRepository(Lists);
      const listFound = await listAnalysisStatusRepository.findOne({
        where: { id: listId },
      });
      if (!listFound) {
        throw new NotFoundException(`List ${listId} status not found.`);
      }
      const listResponse: listInfoResponse = {
        listId: listFound.id,
        listName: listFound.listName,
        locationCount: listFound.listLocationsCount,
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
  ): Promise<paginatedListInfoResponse> {
    const skip = pageNum > 0 ? (pageNum - 1) * pageSize : 0;
    const take = pageSize == 0 ? 10 : pageSize;
    try {
      const connection = await this.getOrganizationConnection(organizationId);
      const listRepository = connection.getRepository(Lists);
      const [paginatedList, count] = await listRepository.findAndCount({
        skip,
        take,
      });
      // If list not found, return null
      if (!paginatedList.length || !count) {
        console.warn('Lists not found.');
        throw new NotFoundException(`pageNum ${pageNum} or pageSize ${pageSize} out of range`);
      }

      const paginatedListInfo: paginatedListInfoResponse = {
        totalResults: count,
        listInfo: paginatedList.map((list) => ({
          listId: list.id,
          listName: list.listName,
          locationCount: list.listLocationsCount,
        })),
      };
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
