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

    it('should handle multiple newlines and spaces', () => {
      const result = validator.formatLocationName('\n\nLocation\n\nName\n\n');
      expect(result).toBe('LocationName');
    });

    it('should handle empty string', () => {
      const result = validator.formatLocationName('');
      expect(result).toBe('');
    });

    it('should handle string with only whitespace', () => {
      const result = validator.formatLocationName('   \n  \0  ');
      expect(result).toBe('');
    });
  });

  describe('isValidLocationName', () => {
    it('should return true for valid alphanumeric names with spaces', () => {
      expect(validator['isValidLocationName']('Location 123')).toBe(true);
      expect(validator['isValidLocationName']('Test Name')).toBe(true);
      expect(validator['isValidLocationName']('123')).toBe(true);
      expect(validator['isValidLocationName']('a')).toBe(true);
      expect(validator['isValidLocationName']('A')).toBe(true);
      expect(validator['isValidLocationName']('0')).toBe(true);
    });

    it('should return true for names with allowed special characters', () => {
      expect(validator['isValidLocationName']('Location[Name]')).toBe(true);
      expect(validator['isValidLocationName']('Test-Name')).toBe(true);
      expect(validator['isValidLocationName']('Name(123)')).toBe(true);
      expect(validator['isValidLocationName']('Location.Name')).toBe(true);
      expect(validator['isValidLocationName']('Location_Name')).toBe(true);
      expect(validator['isValidLocationName']('Test[123]-Name(456)')).toBe(true);
      expect(validator['isValidLocationName']('Test.Name_123')).toBe(true);
    });

    it('should return false for names with non-allowed special characters', () => {
      expect(validator['isValidLocationName']('Location@Name')).toBe(false);
      expect(validator['isValidLocationName']('Test#Name')).toBe(false);
      expect(validator['isValidLocationName']('Name!')).toBe(false);
      expect(validator['isValidLocationName']('Name$')).toBe(false);
      expect(validator['isValidLocationName']('Name%')).toBe(false);
      expect(validator['isValidLocationName']('Name&')).toBe(false);
      expect(validator['isValidLocationName']('Name*')).toBe(false);
      expect(validator['isValidLocationName']('Name+')).toBe(false);
      expect(validator['isValidLocationName']('Name=')).toBe(false);
      expect(validator['isValidLocationName']('Name/')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(validator['isValidLocationName']('')).toBe(true);
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

    it('should preserve allowed special characters', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { locationName: 'Test[Location]-Name(123)' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      validator.validateAndFormatLocationName(feature);
      expect(feature.properties.locationName).toBe('Test[Location]-Name(123)');
    });

    it('should remove non-allowed special characters while preserving allowed ones', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { locationName: 'Test@Location[Name]-123' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      validator.validateAndFormatLocationName(feature);
      expect(feature.properties.locationName).toBe('TestLocation[Name]-123');
    });

    it('should handle null properties', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: null,
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      validator.validateAndFormatLocationName(feature);
      expect(feature.properties).toEqual({ locationName: '' });
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

    it('should handle complex mixed cases', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { locationName: '  Test@Location[Name]-123(456).789_ABC  \n' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      validator.validateAndFormatLocationName(feature);
      expect(feature.properties.locationName).toBe('TestLocation[Name]-123(456).789_ABC');
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

    it('should handle empty features array', async () => {
      const mockRequest: PreviewListRequest = {
        path: '/test/path',
        preview: true,
      };

      const input: ChainType = {
        request: mockRequest,
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
      };

      const result = await validator.handle(input);
      expect(result).toEqual(input);
    });

    it('should handle features with missing properties', async () => {
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
              properties: {},
              geometry: { type: 'Point', coordinates: [0, 0] },
            },
          ],
        },
      };

      const result = await validator.handle(input);
      expect(result.geojson.features[0].properties.locationName).toBe('undefined');
    });
  });
});
