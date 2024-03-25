/**
 * @jest-environment node
 */
const FcdValidationSchema = require('./FcdValidationSchema');

describe('FcdValidationSchema', () => {
  it('should validate and transform a valid input successfully', () => {
    const validInput = {
      listId: '123',
      category: 'WDPA,landmark',
      country: 'testCountry',
      countryGadm: 'testGadm',
      locationId: '456',
    };

    const expectedOutput = {
      listId: 123,
      category: ['WDPA', 'landmark'],
      country: 'testCountry',
      countryGadm: 'testGadm',
      locationId: 456,
    };

    expect(FcdValidationSchema.parse(validInput)).toEqual(expectedOutput);
  });

  it('should throw an error for invalid category', () => {
    const invalidInput = {
      listId: '123',
      category: 'invalidCategory,anotherInvalidCategory',
      country: 'testCountry',
      countryGadm: 'testGadm',
    };

    expect(() => FcdValidationSchema.parse(invalidInput)).toThrow();
  });

  it('should accept optional locationId', () => {
    const inputWithoutLocationId = {
      listId: '123',
      category: 'WDPA',
      country: 'testCountry',
      countryGadm: 'testGadm',
    };

    expect(() => FcdValidationSchema.parse(inputWithoutLocationId)).not.toThrow();
  });

  it('should reject missing mandatory fields', () => {
    const inputMissingMandatoryFields = {
      category: 'WDPA',
    };

    expect(() => FcdValidationSchema.parse(inputMissingMandatoryFields)).toThrow();
  });
});
