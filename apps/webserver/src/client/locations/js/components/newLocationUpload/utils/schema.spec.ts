import {
  alphanumericWithSpaceSchema,
  locationNameSchema,
  coordinateSchema,
  locationNameWithSpecialCharsSchema,
} from './schema';

describe('Schema Validation', () => {
  describe('alphanumericWithSpaceSchema', () => {
    it('should accept valid alphanumeric strings', () => {
      expect(alphanumericWithSpaceSchema.safeParse('abc123').success).toBe(true);
      expect(alphanumericWithSpaceSchema.safeParse('ABC123').success).toBe(true);
      expect(alphanumericWithSpaceSchema.safeParse('123').success).toBe(true);
      expect(alphanumericWithSpaceSchema.safeParse('abc 123').success).toBe(true);
    });

    it('should reject strings with special characters', () => {
      expect(alphanumericWithSpaceSchema.safeParse('test[123]').success).toBe(false);
      expect(alphanumericWithSpaceSchema.safeParse('test(123)').success).toBe(false);
      expect(alphanumericWithSpaceSchema.safeParse('test-123').success).toBe(false);
      expect(alphanumericWithSpaceSchema.safeParse('test_123').success).toBe(false);
      expect(alphanumericWithSpaceSchema.safeParse('test.123').success).toBe(false);
    });

    it('should reject strings with leading or trailing spaces', () => {
      const result = alphanumericWithSpaceSchema.safeParse(' test123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Leading or trailing spaces are not allowed');
      }
    });
  });

  describe('locationNameWithSpecialCharsSchema', () => {
    it('should accept strings with allowed special characters', () => {
      expect(locationNameWithSpecialCharsSchema.safeParse('test[123]').success).toBe(true);
      expect(locationNameWithSpecialCharsSchema.safeParse('test(123)').success).toBe(true);
      expect(locationNameWithSpecialCharsSchema.safeParse('test-123').success).toBe(true);
      expect(locationNameWithSpecialCharsSchema.safeParse('test_123').success).toBe(true);
      expect(locationNameWithSpecialCharsSchema.safeParse('test.123').success).toBe(true);
    });

    it('should reject strings with disallowed special characters', () => {
      expect(locationNameWithSpecialCharsSchema.safeParse('test@123').success).toBe(false);
      expect(locationNameWithSpecialCharsSchema.safeParse('test#123').success).toBe(false);
      expect(locationNameWithSpecialCharsSchema.safeParse('test$123').success).toBe(false);
    });

    it('should reject strings with leading or trailing spaces', () => {
      const result = locationNameWithSpecialCharsSchema.safeParse(' test123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Leading or trailing spaces are not allowed');
      }
    });
  });

  describe('locationNameSchema', () => {
    it('should accept valid location names', () => {
      expect(locationNameSchema.safeParse('Farm 123').success).toBe(true);
      expect(locationNameSchema.safeParse('Farm[123]').success).toBe(true);
      expect(locationNameSchema.safeParse('Farm(123)').success).toBe(true);
    });

    it('should reject empty strings', () => {
      const result = locationNameSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Enter location name');
      }
    });

    it('should reject strings with only spaces', () => {
      const result = locationNameSchema.safeParse('   ');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Leading or trailing spaces are not allowed');
      }
    });
  });

  describe('coordinateSchema', () => {
    it('should accept valid coordinates', () => {
      expect(
        coordinateSchema.safeParse({
          latitude: '45.123456',
          longitude: '-120.123456',
        }).success
      ).toBe(true);
    });

    it('should reject invalid latitude values', () => {
      const result = coordinateSchema.safeParse({
        latitude: '91.123456',
        longitude: '-120.123456',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('latitude is invalid');
      }
    });

    it('should reject invalid longitude values', () => {
      const result = coordinateSchema.safeParse({
        latitude: '45.123456',
        longitude: '181.123456',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('longitude is invalid');
      }
    });

    it('should reject non-decimal format', () => {
      const result = coordinateSchema.safeParse({
        latitude: '45,123456',
        longitude: '-120,123456',
      });
      expect(result.success).toBe(false);
    });
  });
});
