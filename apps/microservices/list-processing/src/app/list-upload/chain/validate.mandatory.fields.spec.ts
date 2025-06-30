import { ValidateMandatoryFields, convertProperties } from './validate.mandatory.fields'; // Adjust the import path as necessary
import { ChainType, RequestNewList } from './types'; // Adjust the import path as necessary
import { Feature } from '@wri-monorepos/geo';

describe('ValidateMandatoryFields', () => {
  let validator: ValidateMandatoryFields;

  beforeEach(() => {
    validator = new ValidateMandatoryFields();
  });

  describe('Field Validation Logic', () => {
    it('should validate mandatory fields for a polygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, 0],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                  ],
                ],
              },
              properties: {
                locationName: 'Test Location',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result).toEqual(input);
    });

    it('should add error details for missing mandatory fields in a polygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, 0],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                  ],
                ],
              },
              properties: {},
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
    });

    it('should add error details for null mandatory fields in a polygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, 0],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                  ],
                ],
              },
              properties: {
                locationName: null,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
    });

    it('should add error details for undefined mandatory fields in a polygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, 0],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                  ],
                ],
              },
              properties: {
                locationName: undefined,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
    });

    it('should add error details for empty string mandatory fields in a polygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, 0],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                  ],
                ],
              },
              properties: {
                locationName: '',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
    });

    it('should add error details for whitespace-only string mandatory fields in a polygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, 0],
                    [1, 1],
                    [1, 0],
                    [0, 0],
                  ],
                ],
              },
              properties: {
                locationName: '   \t\n  ',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
    });

    it('should validate mandatory fields for a point shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                analysisRadius: 100,
                analysisArea: 200,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result).toEqual(input);
    });

    it('should add error details for missing mandatory fields in a point shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: analysisRadius, analysisArea'
      );
    });

    it('should add error details for null mandatory fields in a point shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                analysisRadius: null,
                analysisArea: null,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: analysisRadius, analysisArea'
      );
    });

    it('should validate point shapefile has all mandatory fields', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                analysisRadius: 2,
                analysisArea: 1,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
    });

    it('should validate mandatory fields for a CSV file', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                latitude: 10,
                longitude: 20,
                analysisRadius: 100,
                analysisArea: 200,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result).toEqual(input);
    });

    it('should add error details for missing mandatory fields in a CSV file', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: latitude, longitude, analysisRadius, analysisArea'
      );
    });

    it('should add error details for null mandatory fields in a CSV file', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                latitude: null,
                longitude: null,
                analysisRadius: null,
                analysisArea: null,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: latitude, longitude, analysisRadius, analysisArea'
      );
    });

    it('should add error details for NaN numeric fields in a CSV file', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                latitude: NaN,
                longitude: NaN,
                analysisRadius: NaN,
                analysisArea: NaN,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: latitude, longitude, analysisRadius, analysisArea'
      );
    });

    it('should throw an error for invalid file extension', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.txt',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
              },
            },
          ],
        },
      };

      await expect(validator.handle(input)).rejects.toThrow('Invalid file extension: .txt');
    });

    it('should validate point shapefile with only analysisRadius', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                analysisRadius: 100,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
    });

    it('should validate point shapefile with only analysisArea', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                analysisArea: 200,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
    });

    it('should validate CSV file with only analysisRadius', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                latitude: 10,
                longitude: 20,
                analysisRadius: 100,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
    });

    it('should validate CSV file with only analysisArea', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                latitude: 10,
                longitude: 20,
                analysisArea: 200,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
    });

    it('should add error details when both analysisRadius and analysisArea are missing in point shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: analysisRadius, analysisArea'
      );
    });

    it('should add error details when both analysisRadius and analysisArea are null in point shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                analysisRadius: null,
                analysisArea: null,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: analysisRadius, analysisArea'
      );
    });

    it('should add error details when both analysisRadius and analysisArea are missing in CSV file', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                latitude: 10,
                longitude: 20,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: analysisRadius, analysisArea'
      );
    });

    it('should not validate analysisRadius or analysisArea for KML files', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.kml',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
    });

    it('should handle mixed valid and invalid fields', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Test Location',
                latitude: 10,
                longitude: null, // Invalid
                analysisRadius: 100,
                analysisArea: '', // Invalid
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: longitude'
      );
    });

    it('should handle multiple features with different validation states', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.csv',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                locationName: 'Valid Location',
                latitude: 10,
                longitude: 20,
                analysisRadius: 100,
                analysisArea: 200,
              },
            },
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [1, 1] },
              properties: {
                locationName: null, // Invalid
                latitude: 15,
                longitude: 25,
                analysisRadius: 150,
                analysisArea: 250,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
      expect(result.geojson.features[1].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
      expect((result.request as RequestNewList).hasUnanalyzableError).toBe(true);
    });

    it('should validate mandatory fields for a MultiPolygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [0, 0],
                      [1, 1],
                      [1, 0],
                      [0, 0],
                    ],
                  ],
                ],
              },
              properties: {
                locationName: 'Test Location',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result).toEqual(input);
    });

    it('should add error details for missing mandatory fields in a MultiPolygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [0, 0],
                      [1, 1],
                      [1, 0],
                      [0, 0],
                    ],
                  ],
                ],
              },
              properties: {},
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
    });

    it('should add error details for null mandatory fields in a MultiPolygon shapefile', async () => {
      const input: ChainType = {
        request: {
          fileDownloadedPath: 'path/to/file.zip',
        } as RequestNewList,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [0, 0],
                      [1, 1],
                      [1, 0],
                      [0, 0],
                    ],
                  ],
                ],
              },
              properties: {
                locationName: null,
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toContain(
        'Missing mandatory fields: locationName'
      );
    });
  });

  describe('Property Conversion', () => {
    it('should remove nulls and trim string from non numeric fields', () => {
      const mockFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-100, 12],
        },
        properties: {
          locationName: 'Test Location 2',
          'Location Classification': 'Loc Classifi. \0\0\0\0    ',
          'Company ID': 'company ID     ',
          'custom property': 'my custom prop \0\0\0\0    ',
        },
      } as Feature;

      const result = convertProperties(mockFeature);

      expect(result).toEqual({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-100, 12],
        },
        properties: {
          locationName: 'Test Location 2',
          'Location Classification': 'Loc Classifi.',
          'Company ID': 'company ID',
          'custom property': 'my custom prop',
        },
      });
    });

    it('should convert expected numeric values', () => {
      const mockFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-100, 12],
        },
        properties: {
          ' Location_N': 'Test Location',
          'Latitude ': '\0 \n12',
          ' Longitude ': '-100\t',
          ' custom property ': 'value',
        },
      } as Feature;

      const result = convertProperties(mockFeature);

      expect(result).toEqual({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-100, 12],
        },
        properties: {
          locationName: 'Test Location',
          latitude: 12,
          longitude: -100,
          'custom property': 'value',
        },
      });
    });

    it('should correctly map properties from shapefile format to desired format', () => {
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          Location_N: 'Test Location',
          Latitude: 0,
          Longitude: 100,
          Analysis_R: 500,
          Analysis_A: 1000,
          Location_C: 'Urban',
          Company_ID: 'COMP123',
          Volume: 5000,
          Owner_Name: 'Test Owner',
          Owner_ID: 'OWN123',
          Company_Na: 'Test Company',
          Supplier_N: 'Test Supplier',
          Facility_N: 'Test Facility',
          Refinery_N: 'Test Refinery',
          Certificat: 'Yes',
          Time_Horiz: '2023',
          Start_Date: '2023-01-01',
          End_Date: '2023-12-31',
        },
      };

      const result = convertProperties(mockFeature);

      expect(result.properties).toEqual({
        locationName: 'Test Location',
        latitude: 0,
        longitude: 100,
        analysisRadius: 500,
        analysisArea: 1000,
        'Location Classification': 'Urban',
        'Company ID': 'COMP123',
        Volume: 5000,
        'Owner Name': 'Test Owner',
        'Owner ID': 'OWN123',
        'Company Name': 'Test Company',
        'Supplier Name': 'Test Supplier',
        'Facility Name': 'Test Facility',
        'Refinery Name': 'Test Refinery',
        Certification: 'Yes',
        'Time Horizon': '2023',
        'Start Date': '2023-01-01',
        'End Date': '2023-12-31',
      });
    });

    it('should handle missing properties', () => {
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          Location_N: 'Test Location',
          Latitude: 0,
          Longitude: 100,
        },
      };

      const result = convertProperties(mockFeature);

      expect(result.properties).toEqual({
        locationName: 'Test Location',
        latitude: 0,
        longitude: 100,
      });
    });

    it('should handle properties with extra spaces', () => {
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          ' Location_N': 'Test Location',
          'Latitude ': 0,
          ' Longitude ': 100,
          ' custom property ': 'value',
        },
      };

      const result = convertProperties(mockFeature);

      expect(result.properties).toEqual({
        locationName: 'Test Location',
        latitude: 0,
        longitude: 100,
        'custom property': 'value',
      });
    });

    it('should convert string numbers to actual numbers', () => {
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          ' Location_N': 'Test Location',
          'Latitude ': '0',
          ' Longitude ': '100',
          ' custom property ': 'value',
        },
      };

      const result = convertProperties(mockFeature);

      expect(result.properties).toEqual({
        locationName: 'Test Location',
        latitude: 0,
        longitude: 100,
        'custom property': 'value',
      });
    });

    it('should handle already converted properties', () => {
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          locationName: 'Test Location',
          'Location Classification': 'Urban',
          'Company ID': 'COMP123',
          'custom property': 'value',
        },
      };

      const result = convertProperties(mockFeature);

      expect(result.properties).toEqual({
        locationName: 'Test Location',
        'Location Classification': 'Urban',
        'Company ID': 'COMP123',
        'custom property': 'value',
      });
    });

    it('should handle null and undefined values in properties', () => {
      const mockFeature: Feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          locationName: 'Test Location',
          'Location Classification': null,
          'Company ID': undefined,
          'custom property': 'value',
        },
      };

      const result = convertProperties(mockFeature);

      expect(result.properties).toEqual({
        locationName: 'Test Location',
        'Location Classification': null,
        'Company ID': undefined,
        'custom property': 'value',
      });
    });
  });

  describe('isValidFieldValue acceptance criteria', () => {
    describe('should pass validation for valid values', () => {
      it('should accept non-empty strings', () => {
        expect(validator.isValidFieldValue('valid string')).toBe(true);
        expect(validator.isValidFieldValue('  valid with spaces  ')).toBe(true);
        expect(validator.isValidFieldValue('0')).toBe(true);
        expect(validator.isValidFieldValue('false')).toBe(true);
      });

      it('should accept valid numbers', () => {
        expect(validator.isValidFieldValue(0)).toBe(true);
        expect(validator.isValidFieldValue(1)).toBe(true);
        expect(validator.isValidFieldValue(-1)).toBe(true);
        expect(validator.isValidFieldValue(3.14)).toBe(true);
        expect(validator.isValidFieldValue(Number.MAX_SAFE_INTEGER)).toBe(true);
        expect(validator.isValidFieldValue(Number.MIN_SAFE_INTEGER)).toBe(true);
      });

      it('should accept boolean values', () => {
        expect(validator.isValidFieldValue(true)).toBe(true);
        expect(validator.isValidFieldValue(false)).toBe(true);
      });

      it('should accept objects and arrays', () => {
        expect(validator.isValidFieldValue({ key: 'value' })).toBe(true);
        expect(validator.isValidFieldValue([1, 2, 3])).toBe(true);
        expect(validator.isValidFieldValue([])).toBe(true);
        expect(validator.isValidFieldValue({})).toBe(true);
      });

      it('should accept date objects', () => {
        expect(validator.isValidFieldValue(new Date())).toBe(true);
        expect(validator.isValidFieldValue(new Date('2023-01-01'))).toBe(true);
      });
    });

    describe('should fail validation for invalid values', () => {
      it('should reject null and undefined', () => {
        expect(validator.isValidFieldValue(null)).toBe(false);
        expect(validator.isValidFieldValue(undefined)).toBe(false);
      });

      it('should reject empty strings', () => {
        expect(validator.isValidFieldValue('')).toBe(false);
        expect(validator.isValidFieldValue('   ')).toBe(false);
        expect(validator.isValidFieldValue('\t\n\r')).toBe(false);
      });

      it('should reject invalid numbers', () => {
        expect(validator.isValidFieldValue(NaN)).toBe(false);
        expect(validator.isValidFieldValue(Infinity)).toBe(false);
        expect(validator.isValidFieldValue(-Infinity)).toBe(false);
      });
    });
  });

  describe('Acceptance criteria - Lists that should pass validation', () => {
    describe('CSV files with valid data', () => {
      it('should pass validation for CSV with all required fields', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.csv',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  latitude: 10,
                  longitude: 20,
                  analysisRadius: 100,
                  analysisArea: 200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for CSV with only analysisRadius', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.csv',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  latitude: 10,
                  longitude: 20,
                  analysisRadius: 100,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for CSV with only analysisArea', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.csv',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  latitude: 10,
                  longitude: 20,
                  analysisArea: 200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for CSV with zero values', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.csv',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  latitude: 0,
                  longitude: 0,
                  analysisRadius: 0,
                  analysisArea: 0,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for CSV with negative values', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.csv',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  latitude: -90,
                  longitude: -180,
                  analysisRadius: -100,
                  analysisArea: -200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });
    });

    describe('Shapefile (ZIP) files with valid data', () => {
      it('should pass validation for polygon shapefile with locationName', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.zip',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [0, 0],
                      [1, 1],
                      [1, 0],
                      [0, 0],
                    ],
                  ],
                },
                properties: {
                  locationName: 'Test Location',
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for point shapefile with all required fields', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.zip',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  analysisRadius: 100,
                  analysisArea: 200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for point shapefile with only analysisRadius', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.zip',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  analysisRadius: 100,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for point shapefile with only analysisArea', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.zip',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  analysisArea: 200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for MultiPolygon shapefile with locationName', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.zip',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [0, 0],
                        [1, 1],
                        [1, 0],
                        [0, 0],
                      ],
                    ],
                  ],
                },
                properties: {
                  locationName: 'Test Location',
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });
    });

    describe('KML/KMZ files with valid data', () => {
      it('should pass validation for KML file with locationName', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.kml',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for KMZ file with locationName', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.kmz',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });
    });

    describe('Excel files with valid data', () => {
      it('should pass validation for XLS file with all required fields', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.xls',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  latitude: 10,
                  longitude: 20,
                  analysisRadius: 100,
                  analysisArea: 200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for XLSX file with all required fields', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.xlsx',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  latitude: 10,
                  longitude: 20,
                  analysisRadius: 100,
                  analysisArea: 200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });
    });

    describe('GeoJSON/JSON files with valid data', () => {
      it('should pass validation for GeoJSON polygon with locationName', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.geojson',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [0, 0],
                      [1, 1],
                      [1, 0],
                      [0, 0],
                    ],
                  ],
                },
                properties: {
                  locationName: 'Test Location',
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });

      it('should pass validation for JSON point with all required fields', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.json',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Test Location',
                  analysisRadius: 100,
                  analysisArea: 200,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        expect(result.geojson.features[0].properties).not.toHaveProperty('errorDetails');
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });
    });

    describe('Multiple features with valid data', () => {
      it('should pass validation for multiple valid features', async () => {
        const input: ChainType = {
          request: {
            fileDownloadedPath: 'path/to/file.csv',
          } as RequestNewList,
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {
                  locationName: 'Location 1',
                  latitude: 10,
                  longitude: 20,
                  analysisRadius: 100,
                  analysisArea: 200,
                },
              },
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [1, 1] },
                properties: {
                  locationName: 'Location 2',
                  latitude: 15,
                  longitude: 25,
                  analysisRadius: 150,
                  analysisArea: 250,
                },
              },
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [2, 2] },
                properties: {
                  locationName: 'Location 3',
                  latitude: 20,
                  longitude: 30,
                  analysisRadius: 200,
                  analysisArea: 300,
                },
              },
            ],
          },
        };

        const result = await validator.handle(input);
        result.geojson.features.forEach((feature) => {
          expect(feature.properties).not.toHaveProperty('errorDetails');
        });
        expect((result.request as RequestNewList).hasUnanalyzableError).toBeUndefined();
      });
    });
  });
});
