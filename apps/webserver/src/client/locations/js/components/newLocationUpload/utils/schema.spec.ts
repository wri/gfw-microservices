import { locationNameSchema, coordinateSchema, listNameSchema } from './schema';

describe('Schema Validation', () => {
  describe('locationNameSchema', () => {
    it('should accept valid location names with extended characters', () => {
      expect(locationNameSchema.safeParse('Farm 123').success).toBe(true);
      expect(locationNameSchema.safeParse('Farm[123]').success).toBe(true);
      expect(locationNameSchema.safeParse('Farm(123)').success).toBe(true);
      expect(locationNameSchema.safeParse('Farm-123').success).toBe(true);
      expect(locationNameSchema.safeParse('Farm_123').success).toBe(true);
      expect(locationNameSchema.safeParse('Farm.123').success).toBe(true);
    });

    it('should reject invalid special characters', () => {
      expect(locationNameSchema.safeParse('Farm@123').success).toBe(false);
      expect(locationNameSchema.safeParse('Farm#123').success).toBe(false);
      expect(locationNameSchema.safeParse('Farm$123').success).toBe(false);
    });

    it('should reject strings with leading or trailing spaces', () => {
      const leadingSpace = locationNameSchema.safeParse(' Farm[123]');
      const trailingSpace = locationNameSchema.safeParse('Farm[123] ');
      const bothSpaces = locationNameSchema.safeParse(' Farm[123] ');

      expect(leadingSpace.success).toBe(false);
      expect(trailingSpace.success).toBe(false);
      expect(bothSpaces.success).toBe(false);

      if (!leadingSpace.success) {
        expect(leadingSpace.error.issues[0].message).toBe(
          'Leading or trailing spaces are not allowed'
        );
      }
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

  describe('listNameSchema', () => {
    it('should accept valid list names with allowed characters', () => {
      expect(listNameSchema.safeParse('List 123').success).toBe(true);
      expect(listNameSchema.safeParse('List-123').success).toBe(true);
      expect(listNameSchema.safeParse('List_123').success).toBe(true);
      expect(listNameSchema.safeParse('Listé 123').success).toBe(true);
      expect(listNameSchema.safeParse('Listê 123').success).toBe(true);
      expect(listNameSchema.safeParse('Listà 123').success).toBe(true);
    });

    it('should reject periods and other special characters', () => {
      expect(listNameSchema.safeParse('List.123').success).toBe(false);
      expect(listNameSchema.safeParse('List@123').success).toBe(false);
      expect(listNameSchema.safeParse('List#123').success).toBe(false);
      expect(listNameSchema.safeParse('List$123').success).toBe(false);
      expect(listNameSchema.safeParse('List[123]').success).toBe(false);
      expect(listNameSchema.safeParse('List(123)').success).toBe(false);
    });

    it('should reject strings with leading or trailing spaces', () => {
      const leadingSpace = listNameSchema.safeParse(' List123');
      const trailingSpace = listNameSchema.safeParse('List123 ');
      const bothSpaces = listNameSchema.safeParse(' List123 ');

      expect(leadingSpace.success).toBe(false);
      expect(trailingSpace.success).toBe(false);
      expect(bothSpaces.success).toBe(false);

      if (!leadingSpace.success) {
        expect(leadingSpace.error.issues[0].message).toBe(
          'Leading or trailing spaces are not allowed'
        );
      }
    });
  });
});
