import { ValidateMandatoryFields } from './validate.mandatory.fields'; // Adjust the import path as necessary
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
