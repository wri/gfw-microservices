import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as path from 'path';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';

const expectedNumberFields = ['latitude', 'longitude', 'analysisArea', 'analysisRadius'];

const removeNullCharacterAndTrim = (properties: Record<string, string | number>) => {
  Object.entries(properties).forEach(([field, value]) => {
    if (typeof value === 'string' && !expectedNumberFields.includes(field)) {
      properties[field] = value.replace(/[\0]/g, '').trim();
    }
  });
};

// unfortunately, this "download shapefile" function from old Pro code generates
// numeric attributes as strings, so we need to convert them to numbers
const convertExpectedNumbers = (properties: Record<string, string | number>) => {
  expectedNumberFields.forEach((field) => {
    if (
      properties[field] !== undefined &&
      properties[field] !== null &&
      typeof properties[field] !== 'number'
    ) {
      properties[field] = Number(String(properties[field]).replace(/[\s\0]/g, ''));
    }
  });
};

export const convertProperties = (feature: Feature): Feature => {
  const mapping: Record<string, string> = {
    Investment: 'locationName',
    'Investment Name': 'locationName',
    Location_N: 'locationName',
    'Location Name': 'locationName',
    Latitude: 'latitude',
    Longitude: 'longitude',
    Analysis_R: 'analysisRadius',
    'Analysis Radius': 'analysisRadius',
    Analysis_A: 'analysisArea',
    'Analysis Area': 'analysisArea',
    Location_C: 'Location Classification',
    Company_ID: 'Company ID',
    Volume: 'Volume',
    Owner_Name: 'Owner Name',
    Owner_ID: 'Owner ID',
    Company_Na: 'Company Name',
    Supplier_N: 'Supplier Name',
    Facility_N: 'Facility Name',
    Refinery_N: 'Refinery Name',
    Certificat: 'Certification',
    Time_Horiz: 'Time Horizon',
    Start_Date: 'Start Date',
    End_Date: 'End Date',
  };

  const newProperties: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(feature.properties)) {
    const trimmedKey = key?.trim();
    const newKey = mapping[trimmedKey] || trimmedKey;
    newProperties[newKey] = value as string | number;
  }
  removeNullCharacterAndTrim(newProperties);
  convertExpectedNumbers(newProperties);
  return {
    ...feature,
    properties: newProperties,
  };
};

const mandatoryFields = {
  zip: {
    '.polygon': ['locationName'],
    '.point': ['locationName', 'analysisRadius', 'analysisArea'],
  },
  '.csv': ['locationName', 'latitude', 'longitude', 'analysisRadius', 'analysisArea'],
  '.xls': ['locationName', 'latitude', 'longitude', 'analysisRadius', 'analysisArea'],
  '.xlsx': ['locationName', 'latitude', 'longitude', 'analysisRadius', 'analysisArea'],
  '.kml': ['locationName'],
  '.kmz': ['locationName'],
  geojson: {
    '.polygon': ['locationName'],
    '.point': ['locationName', 'analysisRadius', 'analysisArea'],
  },
  json: {
    '.polygon': ['locationName'],
    '.point': ['locationName', 'analysisRadius', 'analysisArea'],
  },
  // Add more file extensions and their mandatory fields as needed
};

export class ValidateMandatoryFields extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateMandatoryFields.name);

  async handle(input: ChainType): Promise<ChainType> {
    const { request, geojson } = input;
    const { fileDownloadedPath } = request as RequestNewList; // Assuming fileDownloadedPath contains the path of the file

    // Extract the file extension
    const fileExtension = path.extname(fileDownloadedPath);
    const baseExtension = ['.zip', '.json', '.geojson'].includes(fileExtension)
      ? fileExtension.replace('.', '')
      : fileExtension;

    const fieldsToCheck = mandatoryFields[baseExtension];

    if (!fieldsToCheck) {
      throw new Error(`Invalid file extension: ${fileExtension}`);
    }

    geojson.features = geojson.features.map((feature) => convertProperties(feature));

    // Check if the file is a zip shapefile and determine the geometry type
    if (['.zip', '.json', '.geojson'].includes(fileExtension)) {
      if (!this.validateMultiType(geojson)) {
        (input.request as RequestNewList).hasUnanalyzableError = true;
      }
    } else {
      geojson.features.forEach((feature) => {
        const missingFields = fieldsToCheck.filter((field) => !(field in feature.properties));

        // If both analysisRadius and analysisArea are in the mandatory fields
        if (fieldsToCheck.includes('analysisRadius') && fieldsToCheck.includes('analysisArea')) {
          // Remove both from missing fields if at least one is present
          if ('analysisRadius' in feature.properties || 'analysisArea' in feature.properties) {
            const index = missingFields.indexOf('analysisRadius');
            if (index > -1) {
              missingFields.splice(index, 1);
            }
            const index2 = missingFields.indexOf('analysisArea');
            if (index2 > -1) {
              missingFields.splice(index2, 1);
            }
          }
        }

        if (missingFields.length > 0) {
          feature.properties.errorDetails = feature.properties.errorDetails || [];
          (input.request as RequestNewList).hasUnanalyzableError = true;
          (feature.properties.errorDetails as Array<string>).push(
            `Missing mandatory fields: ${missingFields.join(', ')}`
          );
        }
      });
    }

    return input;
  }

  private validateMultiType(geojson: FeatureCollection): boolean {
    let hasUnanalyzableError = false;
    geojson.features.forEach((feature) => {
      const geometryType = feature.geometry.type;
      let fieldsToCheck: string[];

      if (geometryType === 'Polygon') {
        fieldsToCheck = mandatoryFields['zip']['.polygon'];
      } else if (geometryType === 'Point') {
        fieldsToCheck = mandatoryFields['zip']['.point'];
      } else {
        return;
      }

      const missingFields = fieldsToCheck.filter((field) => !(field in feature.properties));

      // If both analysisRadius and analysisArea are in the mandatory fields
      if (fieldsToCheck.includes('analysisRadius') && fieldsToCheck.includes('analysisArea')) {
        // Remove both from missing fields if at least one is present
        if ('analysisRadius' in feature.properties || 'analysisArea' in feature.properties) {
          const index = missingFields.indexOf('analysisRadius');
          if (index > -1) {
            missingFields.splice(index, 1);
          }
          const index2 = missingFields.indexOf('analysisArea');
          if (index2 > -1) {
            missingFields.splice(index2, 1);
          }
        }
      }

      if (missingFields.length > 0) {
        feature.properties.errorDetails = feature.properties.errorDetails || [];
        hasUnanalyzableError = true;
        (feature.properties.errorDetails as Array<string>).push(
          `Missing mandatory fields: ${missingFields.join(', ')}`
        );
      }
    });
    return !hasUnanalyzableError;
  }
}
