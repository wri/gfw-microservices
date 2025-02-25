import { AbstractHandler, ChainType, RequestNewList } from "./types";
import * as fs from 'fs';
import * as path from 'path';
import { S3Service } from "@wri-monorepos/aws";
import { ConfigService } from "@nestjs/config";
import { ServerConfigType } from "../../../validators/server-config";

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
      const { list_name: listName } = request as RequestNewList;
      const features = geojson.features;
      const errorFeatures = features.filter(feature =>
        feature.properties && feature.properties.errorDetail
      );

      if (errorFeatures.length > 0) {
        const csvRows = ['"Location Name","Error Details"'];

        errorFeatures.forEach(feature => {
          const locationName = feature.properties.locationName || 'Unknown Location';
          const errorDetail = Array.isArray(feature.properties.errorDetail)
            ? feature.properties.errorDetail.join('; ')
            : feature.properties.errorDetail;

          csvRows.push(`"${locationName}","${errorDetail}"`);
        });

        // Create temp directory if it doesn't exist
        await fs.promises.mkdir('tmp', { recursive: true });

        // Generate filename using listName
        const fileName = `${listName}_error_report.csv`;
        const errorFilePath = path.join('tmp', fileName);

        await fs.promises.writeFile(errorFilePath, csvRows.join('\n'));

        const bucket = this.config.get<string>('LARGE_PROCESSING_LIST_BUCKET', { infer: true });
        const key = `${process.env.NODE_ENV}/${listName}_error_report.csv`;
        await this.s3Service.putObject(key, errorFilePath, bucket, 'text/csv');
        const url = await this.s3Service.getFileSignedUrl(key, 'csv', bucket);
      }

      return input;
    } catch (error) {
      console.error('Error generating error file:', error);
      throw error;
    }
  }
}
