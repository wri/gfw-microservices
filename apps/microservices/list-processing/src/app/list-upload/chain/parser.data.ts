import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest } from './types';
import { csv2geojson } from '../parser/csv2geojson.parser';
import * as fs from 'fs';

export class ParserData extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ParserData.name);

  deleteFile(fileDownloadedPath: string): void {
    fs.access(fileDownloadedPath, fs.constants.F_OK, (err) => {
      if (err) {
        this.logger.error(`${fileDownloadedPath} does not exist.`);
      } else {
        fs.unlink(fileDownloadedPath, (err) => {
          if (err) {
            this.logger.error(`Failed to delete ${fileDownloadedPath}: ${err.message}`);
          } else {
            this.logger.log(`${fileDownloadedPath} has been deleted.`);
          }
        });
      }
    });
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { fileDownloadedPath, preview = false } = input.request as PreviewListRequest;

    try {
      // Read the CSV file content asynchronously
      const csvContent = fs.readFileSync(fileDownloadedPath, 'utf8');
      // Convert CSV content to GeoJSON
      const geoJson = await csv2geojson(csvContent, preview);

      this.logger.log('Data parsed successfully');
      // Pass the GeoJSON to the next handler in the chain
      const response = await super.handle({ ...input, geojson: geoJson });
      this.deleteFile(fileDownloadedPath);
      return response;
    } catch (error) {
      // Log the error with more context
      this.logger.error(
        `Error while parsing the data from file: ${fileDownloadedPath}`,
        error.stack
      );
      throw new Error('Error while parsing the data');
    }
  }
}
