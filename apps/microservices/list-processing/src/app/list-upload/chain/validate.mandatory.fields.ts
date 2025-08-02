import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import * as path from 'path';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { determineIdType } from '@wri-monorepos/shared';

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

  /**
   * Validates if a field value is valid (not null, undefined, or empty string)
   */
  public isValidFieldValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    // For strings, check if they're not empty after trimming
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    // For numbers, check if they're not NaN, Infinity, or -Infinity
    if (typeof value === 'number') {
      return !isNaN(value) && isFinite(value);
    }

    return true;
  }

  /**
   * Validates if a field exists and has a valid value
   */
  private isFieldValid(feature: Feature, field: string): boolean {
    return field in feature.properties && this.isValidFieldValue(feature.properties[field]);
  }

  private validateFeature(feature: Feature, fieldsToCheck: string[]): boolean {
    let missingOrInvalidFields = fieldsToCheck.filter(
      (field) => !this.isFieldValid(feature, field)
    );

    // Special handling for analysisRadius and analysisArea - at least one must be present and valid
    if (fieldsToCheck.includes('analysisRadius') && fieldsToCheck.includes('analysisArea')) {
      const hasValidRadius = this.isFieldValid(feature, 'analysisRadius');
      const hasValidArea = this.isFieldValid(feature, 'analysisArea');

      // If at least one is valid, remove both from missing fields
      if (hasValidRadius || hasValidArea) {
        missingOrInvalidFields = missingOrInvalidFields.filter(
          (field) => field !== 'analysisRadius' && field !== 'analysisArea'
        );
      }
    }

    if (missingOrInvalidFields.length > 0) {
      feature.properties.errorDetails = feature.properties.errorDetails || [];
      (feature.properties.errorDetails as Array<string>).push(
        `Missing mandatory fields: ${missingOrInvalidFields.join(', ')}`
      );
      return false;
    }

    return true;
  }

  async handle(input: ChainType): Promise<ChainType> {
    const { request, geojson } = input;
    const { fileDownloadedPath } = request as RequestNewList;

    const fileExtension = path.extname(fileDownloadedPath);
    const baseExtension = ['.zip', '.json', '.geojson'].includes(fileExtension)
      ? fileExtension.replace('.', '')
      : fileExtension;

    const fieldsToCheck = mandatoryFields[baseExtension];

    if (!fieldsToCheck) {
      throw new Error(`Invalid file extension: ${fileExtension}`);
    }

    geojson.features = geojson.features.map((feature) => convertProperties(feature));

    if (['.zip', '.json', '.geojson'].includes(fileExtension)) {
      if (!this.validateMultiType(geojson)) {
        (input.request as RequestNewList).hasUnanalyzableError = true;
      }
    } else {
      let hasError = false;
      geojson.features.forEach((feature) => {
        // because only CAR types
        // don't analysisRadius or analysisArea
        try {
          const idType = determineIdType(feature.properties);

          if (idType !== 'CAR' && !this.validateFeature(feature, fieldsToCheck)) {
            hasError = true;
          }
        } catch (error) {
          this.logger.error(`IdType[${error.name}]: ${error.message}`);
          hasError = true;
        }
      });
      if (hasError) {
        (input.request as RequestNewList).hasUnanalyzableError = true;
      }
    }

    return input;
  }

  private validateMultiType(geojson: FeatureCollection): boolean {
    let hasUnanalyzableError = false;
    geojson.features.forEach((feature) => {
      const geometryType = feature.geometry.type;
      let fieldsToCheck: string[];

      if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        fieldsToCheck = mandatoryFields['zip']['.polygon'];
      } else if (geometryType === 'Point') {
        fieldsToCheck = mandatoryFields['zip']['.point'];
      } else {
        return;
      }

      if (!this.validateFeature(feature, fieldsToCheck)) {
        hasUnanalyzableError = true;
      }
    });
    return !hasUnanalyzableError;
  }
}
