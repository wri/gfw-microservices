import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as path from 'path';

const mandatoryFields = {
  zip: {
    '.polygon': ['locationName'],
    '.point': ['locationName', 'analysisRadius', 'analysisArea'],
  },
  '.csv': ['locationName', 'latitude', 'longitude', 'analysisRadius', 'analysisArea'],
  '.xlsx': ['locationName', 'latitude', 'longitude', 'analysisRadius', 'analysisArea'],
  '.kml': ['locationName'],
  '.kmz': ['locationName'],
  // Add more file extensions and their mandatory fields as needed
};

export class ValidateMandatoryFields extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateMandatoryFields.name);

  async handle(input: ChainType): Promise<ChainType> {
    const { request, geojson } = input;
    const { fileDownloadedPath } = request as RequestNewList; // Assuming fileDownloadedPath contains the path of the file

    // Extract the file extension
    const fileExtension = path.extname(fileDownloadedPath);
    const baseExtension = fileExtension === '.zip' ? 'zip' : fileExtension;

    const fieldsToCheck = mandatoryFields[baseExtension];

    if (!fieldsToCheck) {
      throw new Error(`Invalid file extension: ${fileExtension}`);
    }

    // Check if the file is a zip shapefile and determine the geometry type
    if (fileExtension === '.zip') {
      this.validateShapefile(geojson);
    } else {
      geojson.features.forEach((feature) => {
        const hasFields = fieldsToCheck.every((field) => field in feature.properties);
        if (!hasFields) {
          feature.properties.errorDetails = feature.properties.errorDetails || [];
          (feature.properties.errorDetails as Array<string>).push('Missing mandatory fields');
        }
      });
    }

    return input;
  }

  private validateShapefile(geojson: any) {
    geojson.features.forEach((feature) => {
      const geometryType = feature.geometry.type;
      let fieldsToCheck: string[];

      if (geometryType === 'Polygon') {
        fieldsToCheck = mandatoryFields['zip']['.polygon'];
      } else if (geometryType === 'Point') {
        fieldsToCheck = mandatoryFields['zip']['.point'];
      } else {
        return; // Skip if geometry type is neither polygon nor point
      }

      const hasFields = fieldsToCheck.every((field) => field in feature.properties);
      if (!hasFields) {
        feature.properties.errorDetails = feature.properties.errorDetails || [];
        (feature.properties.errorDetails as Array<string>).push(
          'Missing mandatory fields for shapefile'
        );
      }
    });
  }
}
