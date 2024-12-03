import { ValidateLatLongGeojson } from './validate.lat.long.geojson';
import { ChainType } from './types';

describe('ValidateLatLongGeojson', () => {
  let validator: ValidateLatLongGeojson;

  beforeEach(() => {
    validator = new ValidateLatLongGeojson();
  });

  describe('isValidLatitude', () => {
    it('should return true for valid latitudes', () => {
      expect(validator.isValidLatitude(0)).toBe(true);
      expect(validator.isValidLatitude(90)).toBe(true);
      expect(validator.isValidLatitude(-90)).toBe(true);
    });

    it('should return false for invalid latitudes', () => {
      expect(validator.isValidLatitude(91)).toBe(false);
      expect(validator.isValidLatitude(-91)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('should return true for valid longitudes', () => {
      expect(validator.isValidLongitude(0)).toBe(true);
      expect(validator.isValidLongitude(180)).toBe(true);
      expect(validator.isValidLongitude(-180)).toBe(true);
    });

    it('should return false for invalid longitudes', () => {
      expect(validator.isValidLongitude(181)).toBe(false);
      expect(validator.isValidLongitude(-181)).toBe(false);
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
      expect(validator.validateCoordinates(coordinates, 'Argentina')).toBe(true);
    });

    it('should return false for invalid coordinates', () => {
      const coordinates = [[200, 0]];
      expect(validator.validateCoordinates(coordinates, 'Argentina')).toBe(false);
    });

    it('should handle nested coordinates', () => {
      const coordinates = [[[0, 0]]];
      expect(validator.validateCoordinates(coordinates, 'Argentina')).toBe(true);
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
      expect(result.geojson.features[0].properties.error).toStrictEqual(['Invalid coordinates']);
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

    it('should handle invalid GeoJSON', async () => {
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
      expect(result.geojson.features[0].properties.error).toStrictEqual(['Invalid coordinates']);
    });
  });
});
