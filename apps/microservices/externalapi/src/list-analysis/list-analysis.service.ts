import { Injectable, NotFoundException } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { UserService } from './user.service';
import { ExternalUpload } from './external-upload.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { generateRandomFilename } from '@wri-monorepos/shared';
import { ClientStoreConnection } from '../shared/client-store-connection';
import { OrganizationService } from './organization.service';
import { ListsAnalysisStatus } from './list-analysis-status.entity';

const DEFAULT_ANALYSIS = 'FCD';
@Injectable()
export class ListAnalysisService {
  constructor(
    private config: ConfigService,
    private userService: UserService,
    private clientStoreConnection: ClientStoreConnection,
    private organizationService: OrganizationService
  ) {}
  // Replace this with actual database or external service calls
  async getAnalysisStatus(organizationId: number, listID: number): Promise<ListAnalysisResponse> {
    const connection = await this.getOrganizationConnection(organizationId);
    const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);
    const listAnalysisStatus = await listAnalysisStatusRepository.findOne({
      where: { listId: listID, analysisId: DEFAULT_ANALYSIS },
    });

    // Waiting for changes from Gustavo and Dakota
    const analysisStatus: ListAnalysisResponse = {
      listId: listAnalysisStatus.listId,
      status: 'Completed',
      errorsDetails: listAnalysisStatus.errorInfo ? [listAnalysisStatus.errorInfo] : [],
      resultUrl: listAnalysisStatus.listId ? 'https://example.com/results' : null,
      creationDate: listAnalysisStatus.updateTime,
      expirationDate: '2023-09-28',
    };

    return analysisStatus;
  }

  async prepareUpload(userEmail) {
    const user = await this.userService.findUser(userEmail);
    if (!user) {
      throw new NotFoundException(`User with ${userEmail} not found`);
    }

    const LLP_BASE_URL = this.config.get<string>('LLP_BASE_URL');
    const fileKey = generateRandomFilename('csv');
    const presignedURLResponse = await axios.post<{
      url: string;
      keyFile: string;
      fileS3Route: string;
    }>(`${LLP_BASE_URL}/api/create-presigned-url`, { key: fileKey, contentType: 'text/csv' });
    const { url, keyFile } = presignedURLResponse.data;

    const connection = await this.getOrganizationConnection(user.organization_id);
    const externalUploadRepository = connection.getRepository(ExternalUpload);

    const externalUpload = new ExternalUpload();
    externalUpload.userId = user.id;
    externalUpload.uploadKeyFile = keyFile;
    externalUpload.uploadUrl = url;
    externalUpload.updateDateTime = new Date();

    const newExternalUploadObject = await externalUploadRepository.save(externalUpload);
    return newExternalUploadObject;
  }

  private async getOrganizationConnection(organizationId: number) {
    const organization = await this.organizationService.findOrganizationById(organizationId);
    const connection = await this.clientStoreConnection.getConnection(organization.organizationDb);
    return connection;
  }
}
