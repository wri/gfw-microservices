import { ValidateLocationName } from './validate.location.name'; // Adjust the import path as necessary

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
  });
});
