import { ValidateMandatoryFields, convertProperties } from './validate.mandatory.fields'; // Adjust the import path as necessary
import { ChainType, RequestNewList } from './types'; // Adjust the import path as necessary

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
    expect(result.geojson.features[0].properties.errorDetails[0]).toContain(
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
});

describe('convertProperties', () => {
  it('should correctly map properties from shapefile format to desired format', () => {
    // First we need to make convertProperties accessible for testing
    const mockFeature = {
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
        Certificat: 'ISO-9001',
        Time_Horiz: '2024',
        attribute1: 'attr1',
        attribute2: 'attr2',
        attribute3: 'attr3',
        Start_Date: '2024-01-01',
        End_Date: '2024-12-31',
      },
    };

    const result = convertProperties(mockFeature);

    expect(result).toEqual({
      geometry: {
        coordinates: [100, 0],
        type: 'Point',
      },
      properties: {
        Certification: 'ISO-9001',
        'Company ID': 'COMP123',
        'Company Name': 'Test Company',
        'End Date': '2024-12-31',
        'Facility Name': 'Test Facility',
        'Location Classification': 'Urban',
        'Owner ID': 'OWN123',
        'Owner Name': 'Test Owner',
        'Refinery Name': 'Test Refinery',
        'Start Date': '2024-01-01',
        'Supplier Name': 'Test Supplier',
        'Time Horizon': '2024',
        Volume: 5000,
        analysisArea: 1000,
        analysisRadius: 500,
        attribute1: 'attr1',
        attribute2: 'attr2',
        attribute3: 'attr3',
        latitude: 0,
        locationName: 'Test Location',
        longitude: 100,
      },
      type: 'Feature',
    });
  });

  it('should handle missing properties gracefully', () => {
    const mockFeature = {
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

    expect(result).toEqual({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [100, 0],
      },
      properties: {
        locationName: 'Test Location',
        latitude: 0,
        longitude: 100,
      },
    });
  });

  it('should trim property keys', () => {
    const mockFeature = {
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

    expect(result).toEqual({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [100, 0],
      },
      properties: {
        locationName: 'Test Location',
        latitude: 0,
        longitude: 100,
        'custom property': 'value',
      },
    });
  });
});
