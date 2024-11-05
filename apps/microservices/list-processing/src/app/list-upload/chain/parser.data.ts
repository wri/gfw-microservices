import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest } from './types';
import { csv2geojson } from '../parser/csv2geojson.parser';
import * as fs from 'fs';
import { FeatureCollection } from '@wri-monorepos/geo';
import { convertShapefileToGeoJSON } from '../parser/shp2GeoJson.parser';
import * as path from 'path';
import { xls2geojson } from '../parser/xls2GeoJSON.parser';
import { kml2GeoJSON } from '../parser/kml2GeoJSON.parser';

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

  csvParser = async (fileDownloadedPath: string, preview: boolean): Promise<FeatureCollection> => {
    // Read the CSV file content asynchronously
    const csvContent = fs.readFileSync(fileDownloadedPath, 'utf8');
    // Convert CSV content to GeoJSON
    const geoJson = await csv2geojson(csvContent, preview);

    // Pass the GeoJSON to the next handler in the chain
    return geoJson;
  };

  shapefileParser = async (fileDownloadedPath: string): Promise<FeatureCollection> => {
    const geojson = await convertShapefileToGeoJSON(fileDownloadedPath);
    return geojson;
  };

  xls2geojson = async (fileDownloadedPath: string) => {
    const xlsxContent: Buffer = fs.readFileSync(fileDownloadedPath);
    const geojson = await xls2geojson(xlsxContent);
    return geojson;
  };

  kml2geojson = async (fileDownloadedPath: string) => {
    const kmlContent = fs.readFileSync(fileDownloadedPath, 'utf8');
    const geojson = await kml2GeoJSON(kmlContent);
    return geojson;
  };

  async handle(input: ChainType): Promise<ChainType> {
    const { fileDownloadedPath, preview = false } = input.request as PreviewListRequest;
    const fileExtension = path.extname(fileDownloadedPath);

    const dataParser = {
      '.csv': this.csvParser,
      '.zip': this.shapefileParser,
      '.xls': this.xls2geojson,
      '.xlsx': this.xls2geojson,
      '.kml': this.kml2geojson,
    };

    if (!dataParser[fileExtension]) {
      this.logger.error(`Unsupported file extension: ${fileExtension}`);
      throw new Error('Unsupported file extension');
    }

    try {
      const geoJson = await dataParser[fileExtension](fileDownloadedPath, preview);
      this.logger.log('Data parsed successfully');

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
