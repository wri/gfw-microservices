import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { S3Service } from '@wri-monorepos/aws';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../../validators/server-config';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';

export class GenerateErrorFile extends AbstractHandler<ChainType> {
  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService<ServerConfigType, true>
  ) {
    super();
  }

  async handle(input: ChainType): Promise<ChainType> {
    try {
      const { geojson, request } = input;
      const {
        list_name: listName,
        list_id: listId,
        organization_database: organizationDatabase,
      } = request as RequestNewList;
      const features = geojson.features;
      const errorFeatures = features.filter(
        (feature) => feature.properties && feature.properties.errorDetails
      );

      if (errorFeatures.length > 0) {
        // Sanitize list name to avoid special characters and spaces
        const safeListName = listName.replace(/[^a-zA-Z0-9-]/g, '_').substring(0, 50);
        const fileName = `${safeListName}_error_report.csv`;
        const errorFilePath = path.join('/tmp', fileName);

        const csvRows = ['"Location Name","Error Details"'];
        errorFeatures.forEach((feature) => {
          const locationName = (
            (feature.properties.locationName || 'Unknown Location') as string
          ).replace(/"/g, '""'); // Escape quotes in CSV
          const errorDetail = Array.isArray(feature.properties.errorDetails)
            ? feature.properties.errorDetails.join('; ')
            : feature.properties.errorDetails;

          // Truncate error details if too long
          const truncatedError = (errorDetail as string).substring(0, 1000);
          csvRows.push(`"${locationName}","${truncatedError}"`);
        });

        await fs.promises.mkdir('/tmp', { recursive: true });
        await fs.promises.writeFile(errorFilePath, csvRows.join('\n'));

        const bucket = this.config.get<string>('LARGE_PROCESSING_LIST_ERROR_BUCKET', {
          infer: true,
        });
        const key = `failed/${process.env.NODE_ENV}/${fileName}`;
        await this.s3Service.putObject(key, errorFilePath, bucket, 'text/csv');
        const url = await this.s3Service.getFileSignedUrl(key, 'csv', bucket);

        await this.setListErrorFileStoragePath(organizationDatabase, listId, url);
      }

      return input;
    } catch (error) {
      throw new Error(`Failed to generate error file: ${error.message}`);
    }
  }

  async setListErrorFileStoragePath(organizationDatabase: string, listId: number, url: string) {
    const connection = await new ClientStoreConnection().getConnection(organizationDatabase);
    const listAnalysisStatusRepository = connection.getRepository(Lists);
    await listAnalysisStatusRepository.update({ id: listId }, { errorFileStoragePath: url });
  }
}
