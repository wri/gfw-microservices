import { ValidateLatLongGeojson } from './validate.lat.long.geojson';
import { ChainType } from './types';

describe('ValidateLatLongGeojson', () => {
  let validator: ValidateLatLongGeojson;

  beforeEach(() => {
    validator = new ValidateLatLongGeojson();
  });

  describe('isValidLatitude', () => {
    it('should return true for valid latitudes', () => {
      expect(ValidateLatLongGeojson.isValidLatitude(0)).toBe(true);
      expect(ValidateLatLongGeojson.isValidLatitude(90)).toBe(true);
      expect(ValidateLatLongGeojson.isValidLatitude(-90)).toBe(true);
    });

    it('should return false for invalid latitudes', () => {
      expect(ValidateLatLongGeojson.isValidLatitude(91)).toBe(false);
      expect(ValidateLatLongGeojson.isValidLatitude(-91)).toBe(false);
    });
  });

  describe('isLatitudeInSupportedRange', () => {
    it('should return true for latitudes within supported range', () => {
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(0)).toBe(true);
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(-62)).toBe(true);
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(84)).toBe(true);
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(45)).toBe(true);
    });

    it('should return false for latitudes outside supported range', () => {
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(-63)).toBe(false);
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(-90)).toBe(false);
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(85)).toBe(false);
      expect(ValidateLatLongGeojson.isLatitudeInSupportedRange(90)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('should return true for valid longitudes', () => {
      expect(ValidateLatLongGeojson.isValidLongitude(0)).toBe(true);
      expect(ValidateLatLongGeojson.isValidLongitude(180)).toBe(true);
      expect(ValidateLatLongGeojson.isValidLongitude(-180)).toBe(true);
    });

    it('should return false for invalid longitudes', () => {
      expect(ValidateLatLongGeojson.isValidLongitude(181)).toBe(false);
      expect(ValidateLatLongGeojson.isValidLongitude(-181)).toBe(false);
    });
  });

  describe('isOnAntarctica', () => {
    it('should return true for Antarctica', () => {
      expect(validator.isValidCountry('Antarctica')).toBe(false);
      expect(validator.isValidCountry('antarctica')).toBe(false);
    });

    it('should return false for other countries', () => {
      expect(validator.isValidCountry('USA')).toBe(true);
      expect(validator.isValidCountry('Brazil')).toBe(true);
    });

    it('should return false if country is empty', () => {
      expect(validator.isValidCountry('')).toBe(false);
      expect(validator.isValidCountry('')).toBe(false);
    });

    it('should return false if country is null', () => {
      expect(validator.isValidCountry(null)).toBe(false);
      expect(validator.isValidCountry(null)).toBe(false);
    });

    it('should return false if country is undefined', () => {
      expect(validator.isValidCountry(undefined)).toBe(false);
      expect(validator.isValidCountry(undefined)).toBe(false);
    });
  });

  describe('validateCoordinates', () => {
    it('should return true for valid coordinates', () => {
      const coordinates = [[0, 0]];
      expect(validator.validateCoordinates(coordinates, 'Argentina')).toBe('');
    });

    it('should return false for invalid coordinates', () => {
      const coordinates = [[200, 0]];
      expect(validator.validateCoordinates(coordinates, 'Argentina')).toBe('Invalid coordinates');
    });

    it('should handle nested coordinates', () => {
      const coordinates = [[[0, 0]]];
      expect(validator.validateCoordinates(coordinates, 'Argentina')).toBe('');
    });
  });

  describe('handle', () => {
    it('should handle remove when point is at antarctica', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
              properties: {
                country: 'Antarctica',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].properties.errorDetails).toStrictEqual([
        'Invalid location',
      ]);
    });

    it('should handle valid GeoJSON', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
              properties: {
                country: 'Brazil',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
    });

    it('should handle GeoJSON with invalid coordinates', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [200, 0],
              },
              properties: {
                country: 'Antarctica',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].properties.errorDetails).toStrictEqual([
        'Invalid coordinates',
      ]);
    });

    it('should fail open (not closed) polygon', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
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
                    [2, 2],
                    [2, 0],
                    [0, 2],
                  ],
                ],
              },
              properties: {
                country: 'Brazil',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].properties.errorDetails).toStrictEqual([
        'Invalid polygon geometry',
      ]);
    });

    it('should reject point with latitude south of 62S', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [0, -63],
              },
              properties: {
                country: 'Antarctica',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toStrictEqual([
        'Latitude out of supported range (must be between 62°S and 84°N)',
      ]);
    });

    it('should reject point with latitude north of 84N', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [10, 85],
              },
              properties: {
                country: 'Norway',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toStrictEqual([
        'Latitude out of supported range (must be between 62°S and 84°N)',
      ]);
    });

    it('should reject polygon with vertex outside supported latitude range', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [0, -60],
                    [2, -60],
                    [2, -63],
                    [0, -63],
                    [0, -60],
                  ],
                ],
              },
              properties: {
                country: 'Chile',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.errorDetails).toStrictEqual([
        'Latitude out of supported range (must be between 62°S and 84°N)',
      ]);
    });

    it('should fail self-intersecting polygon', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
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
                    [2, 2],
                    [2, 0],
                    [0, 2],
                    [0, 0],
                  ],
                ],
              },
              properties: {
                country: 'Brazil',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].properties.errorDetails).toStrictEqual([
        'Invalid polygon geometry',
      ]);
    });

    it('should handle multi polygons', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
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
                      [13.99, -13.01],
                      [13.99, -12.99],
                      [14.01, -12.99],
                      [14.01, -13.01],
                      [13.99, -13.01],
                    ],
                  ],
                  [
                    [
                      [14.99, -14.01],
                      [14.99, -13.99],
                      [15.01, -13.99],
                      [15.01, -14.01],
                      [14.99, -14.01],
                    ],
                  ],
                ],
              },
              properties: {
                country: 'Angola',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].geometry.type).toBe('MultiPolygon');
      expect(result.geojson.features[0].properties.errorDetails).toBeUndefined();
    });

    it('should pass shared point', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
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
                      [13.99, -13.01],
                      [13.99, -12.99],
                      [14.01, -12.99],
                      [14.01, -13.01],
                      [13.99, -13.01],
                    ],
                  ],
                  [
                    [
                      [14.01, -12.99],
                      [14.01, -12.97],
                      [14.03, -12.97],
                      [14.03, -12.99],
                      [14.01, -12.99],
                    ],
                  ],
                ],
              },
              properties: {
                country: 'Angola',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].geometry.type).toBe('MultiPolygon');
      expect(result.geojson.features[0].properties.errorDetails).toBeUndefined();
    });

    it('should pass shared line', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
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
                      [13.99, -13.01],
                      [13.99, -12.99],
                      [14.01, -12.99],
                      [14.01, -13.01],
                      [13.99, -13.01],
                    ],
                  ],
                  [
                    [
                      [14.01, -13.01],
                      [14.01, -12.99],
                      [14.03, -12.99],
                      [14.03, -13.01],
                      [14.01, -13.01],
                    ],
                  ],
                ],
              },
              properties: {
                country: 'Angola',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].geometry.type).toBe('MultiPolygon');
      expect(result.geojson.features[0].properties.errorDetails).toBeUndefined();
    });

    it('should fail shared area', async () => {
      const input: ChainType = {
        request: {
          organization_database: 'test_db',
          path: 'path',
        },
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
                      [13.99, -13.01],
                      [13.99, -12.99],
                      [14.01, -12.99],
                      [14.01, -13.01],
                      [13.99, -13.01],
                    ],
                  ],
                  [
                    [
                      [14.001, -13.01],
                      [14.001, -12.99],
                      [14.03, -12.99],
                      [14.03, -13.01],
                      [14.001, -13.01],
                    ],
                  ],
                ],
              },
              properties: {
                country: 'Angola',
              },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features.length).toBe(1);
      expect(result.geojson.features[0].geometry.type).toBe('MultiPolygon');
      const { errorDetails } = result.geojson.features[0].properties;
      expect((errorDetails as Array<any>).length).toBe(1);
      expect(errorDetails[0]).toStrictEqual('Invalid polygon geometry');
    });
  });
});
