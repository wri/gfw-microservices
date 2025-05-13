import { ValidateMandatoryFields, convertProperties } from './validate.mandatory.fields'; // Adjust the import path as necessary
import { ChainType, RequestNewList } from './types'; // Adjust the import path as necessary
import { Feature } from '@wri-monorepos/geo';

describe('ValidateMandatoryFields', () => {
  let validator: ValidateMandatoryFields;

  beforeEach(() => {
    validator = new ValidateMandatoryFields();
  });

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
});

describe('convertProperties', () => {
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
});
