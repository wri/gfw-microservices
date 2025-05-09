import { ValidateLocationName } from './validate.location.name'; // Adjust the import path as necessary
import { Feature } from '@wri-monorepos/geo';
import { ChainType, PreviewListRequest } from './types';

describe('ValidateLocationName', () => {
  let validator: ValidateLocationName;

  beforeEach(() => {
    validator = new ValidateLocationName();
  });

  describe('formatLocationName', () => {
    it('should remove newlines and trim whitespace', () => {
      const result = validator.formatLocationName('  Location\nName  ');
      expect(result).toBe('LocationName');
    });

    it('should remove white space in the middle', () => {
      const result = validator.formatLocationName('  Location Name  ');
      expect(result).toBe('Location Name');
    });

    it('should handle null characters', () => {
      const result = validator.formatLocationName('Location\0Name');
      expect(result).toBe('LocationName');
    });
  });

  describe('isValidLocationName', () => {
    it('should return true for valid alphanumeric names with spaces', () => {
      expect(validator['isValidLocationName']('Location 123')).toBe(true);
      expect(validator['isValidLocationName']('Test Name')).toBe(true);
      expect(validator['isValidLocationName']('123')).toBe(true);
    });

    it('should return false for names with special characters', () => {
      expect(validator['isValidLocationName']('Location@Name')).toBe(false);
      expect(validator['isValidLocationName']('Test-Name')).toBe(false);
      expect(validator['isValidLocationName']('Name!')).toBe(false);
    });
  });

  describe('validateAndFormatLocationName', () => {
    it('should clean and format valid location names', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { locationName: '  Test Location  ' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      validator.validateAndFormatLocationName(feature);
      expect(feature.properties.locationName).toBe('Test Location');
    });

    it('should remove special characters from invalid names', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { locationName: 'Test@Location!' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      validator.validateAndFormatLocationName(feature);
      expect(feature.properties.locationName).toBe('TestLocation');
    });

    it('should handle empty or undefined names', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { locationName: undefined },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      validator.validateAndFormatLocationName(feature);
      expect(feature.properties.locationName).toBe('undefined');
    });
  });

  describe('handle', () => {
    it('should process all features in the geojson', async () => {
      const mockRequest: PreviewListRequest = {
        path: '/test/path',
        preview: true,
      };

      const input: ChainType = {
        request: mockRequest,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { locationName: '  Test@Location  ' },
              geometry: { type: 'Point', coordinates: [0, 0] },
            },
            {
              type: 'Feature',
              properties: { locationName: 'Valid Name' },
              geometry: { type: 'Point', coordinates: [1, 1] },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.locationName).toBe('TestLocation');
      expect(result.geojson.features[1].properties.locationName).toBe('Valid Name');
    });

    it('should throw error for invalid input format', async () => {
      const mockRequest: PreviewListRequest = {
        path: '/test/path',
        preview: true,
      };

      const input: ChainType = {
        request: mockRequest,
        geojson: {
          type: 'FeatureCollection',
          features: null,
        },
      };

      await expect(validator.handle(input)).rejects.toThrow(
        'Invalid input format: locations should be an array'
      );
    });
  });
});
