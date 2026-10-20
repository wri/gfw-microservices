/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, PreviewListRequest } from './types';
import { csv2geojson } from '../parser/csv2geojson.parser';
import * as fs from 'fs';
import { FeatureCollection } from '@wri-monorepos/geo';
import { convertShapefileToGeoJSON } from '../parser/shp2GeoJson.parser';
import * as path from 'path';
import { xls2geojson } from '../parser/xls2GeoJSON.parser';
import { kml2GeoJSON } from '../parser/kml2GeoJSON.parser';
import AdmZip from 'adm-zip';
import { convertProperties } from './validate.mandatory.fields';
import { EmptyDataFileException } from '../../common/emptyDataFile.exception';

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
    const csvContent = fs.readFileSync(fileDownloadedPath, 'utf8');
    const geoJson = await csv2geojson(csvContent, preview);
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

  kml2geojson = async (fileDownloadedPath: string): Promise<FeatureCollection> => {
    const kmlContent = fs.readFileSync(fileDownloadedPath, 'utf8');
    const geojson = await kml2GeoJSON(kmlContent);
    return geojson as unknown as FeatureCollection;
  };

  json2geojson = async (fileDownloadedPath: string): Promise<FeatureCollection> => {
    const jsonString = await fs.readFileSync(fileDownloadedPath, 'utf8');
    return JSON.parse(jsonString) as FeatureCollection;
  };

  kmz2geojson = async (fileDownloadedPath: string): Promise<FeatureCollection> => {
    const zip = new AdmZip(fileDownloadedPath);
    const zipEntries = zip.getEntries();

    // Find the KML file in the KMZ archive
    const kmlEntry = zipEntries.find((entry) => entry.entryName.endsWith('.kml'));
    if (!kmlEntry) {
      this.logger.error(`No KML file found in the KMZ archive: ${fileDownloadedPath}`);
      throw new Error('No KML file found in the KMZ archive');
    }

    const fileName = path.basename(fileDownloadedPath).replace('.kmz', '.kml');
    // Define the path for the extracted KML file
    const kmlFilePath = path.join(path.dirname(fileDownloadedPath), fileName);

    // Extract the KML file to the specified path
    fs.writeFileSync(kmlFilePath, kmlEntry.getData());

    // Parse the extracted KML file
    const geojson = await this.kml2geojson(kmlFilePath);

    // Optionally delete the extracted KML file after parsing
    this.deleteFile(kmlFilePath);

    return geojson;
  };

  private removeTemplateLines(geojson: FeatureCollection): FeatureCollection {
    if (!geojson || !geojson.features) {
      return geojson;
    }

    const templatePatterns = [
      /^Mandatory$/,
      /^String$/,
      /^[nN]ame of the /,
      /^POPULATE WITH DATA BELOW THIS LINE$/,
      /^cocoa farm name$/,
    ];

    return {
      ...geojson,
      features: geojson.features
        .map((feature) => {
          feature = convertProperties(feature);
          // convert locationName to string if it is not already and not null or undefined
          if (
            typeof feature.properties.locationName !== 'string' &&
            feature.properties.locationName !== null &&
            feature.properties.locationName !== undefined
          ) {
            feature.properties.locationName = String(feature.properties.locationName);
          }
          const locationName = (feature.properties.locationName as string)?.trim();
          if (templatePatterns.some((pattern) => pattern.test(locationName))) {
            return null; // Remove the feature
          }
          return feature;
        })
        .filter((feature) => feature !== null),
    };
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { fileDownloadedPath, preview = false } = request.request as PreviewListRequest;
    const fileExtension = path.extname(fileDownloadedPath);

    const dataParser = {
      '.csv': this.csvParser,
      '.zip': this.shapefileParser,
      '.xls': this.xls2geojson,
      '.xlsx': this.xls2geojson,
      '.kml': this.kml2geojson,
      '.kmz': this.kmz2geojson,
      '.json': this.json2geojson,
      '.geojson': this.json2geojson,
    };

    if (!dataParser[fileExtension]) {
      this.logger.error(`Unsupported file extension: ${fileExtension}`);
      throw new Error('Unsupported file extension');
    }

    try {
      const geoJson = await dataParser[fileExtension](fileDownloadedPath, preview);
      const cleanGeoJson = this.removeTemplateLines(geoJson);
      this.logger.log('Data parsed successfully');

      if (cleanGeoJson.features.length === 0) {
        this.logger.warn('The uploaded file is empty after removing template lines.');
        throw new EmptyDataFileException();
      }

      this.deleteFile(fileDownloadedPath);
      return { ...request, geojson: cleanGeoJson };
    } catch (error) {
      if (error instanceof EmptyDataFileException) {
        throw error;
      }

      this.logger.error(
        `Error while parsing the data from file: ${fileDownloadedPath}`,
        error.stack
      );
      throw new Error('Error while parsing the data: ' + error.stack || error);
    }
  }
}
