import { Injectable, NotFoundException } from '@nestjs/common';
import { ListAnalysisResponse } from './list-analysis.dto';
import { UserService } from './user.service';
import { ExternalUpload } from './external-upload.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { generateRandomFilename } from '@wri-monorepos/shared';
import { ClientStoreConnection } from '../shared/client-store-connection';
import { OrganizationService } from './organization.service';
@Injectable()
export class ListAnalysisService {
  constructor(
    private config: ConfigService,
    private userService: UserService,
    private clientStoreConnection: ClientStoreConnection,
    private organizationService: OrganizationService
  ) {}
  // Replace this with actual database or external service calls
  async getAnalysisStatus(listID: string): Promise<ListAnalysisResponse> {
    // Implement the logic to fetch analysis status from your data source
    // You can use a database query or an external API call here

    // Example response (replace with actual data retrieval logic):
    const analysisStatus: ListAnalysisResponse = {
      listId: listID,
      status: 'Completed',
      errorsDetails: [],
      resultUrl: 'https://example.com/results',
      creationDate: '2023-09-21',
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

    const organization = await this.organizationService.findOrganizationById(user.organization_id);
    const connection = await this.clientStoreConnection.getConnection(organization.organizationDb);
    const externalUploadRepository = connection.getRepository(ExternalUpload);

    const externalUpload = new ExternalUpload();
    externalUpload.userId = user.id;
    externalUpload.uploadKeyFile = keyFile;
    externalUpload.uploadUrl = url;
    externalUpload.updateDateTime = new Date();

    const newExternalUploadObject = await externalUploadRepository.save(externalUpload);
    return newExternalUploadObject;
  }
}
