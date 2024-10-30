import { GetObjectTypes } from './getobject.types';

describe('GetObjectTypes', () => {
  let getObjectTypes;

  beforeEach(() => {
    getObjectTypes = new GetObjectTypes();
  });

  test('getObjectTypes should return correct types for object properties', () => {
    const obj = { name: 'John', age: 30, isActive: true };
    const expectedTypes = { name: 'string', age: 'number', isActive: 'boolean' };
    expect(getObjectTypes.getObjectTypes(obj)).toEqual(expectedTypes);
  });

  test('mergeTypes should merge new types into existing types', () => {
    const existingTypes = { name: 'string' };
    const newTypes = { age: 'number', isActive: 'boolean' };
    const expectedMergedTypes = { name: 'string', age: 'number', isActive: 'boolean' };
    expect(getObjectTypes.mergeTypes(existingTypes, newTypes)).toEqual(expectedMergedTypes);
  });

  test('getObjectTypes should exclude specified fields', () => {
    const obj = { name: 'John', age: 30, isActive: true };
    const excludeFields = ['name'];
    const expectedTypes = { age: 'number', isActive: 'boolean' };
    expect(getObjectTypes.getObjectTypes(obj, excludeFields)).toEqual(expectedTypes);
  });

  test('mergeTypes should merge new types into existing types', () => {
    const existingTypes = { name: 'string' };
    const newTypes = { age: 'number', isActive: 'boolean' };
    const expectedMergedTypes = { name: 'string', age: 'number', isActive: 'boolean' };
    expect(getObjectTypes.mergeTypes(existingTypes, newTypes)).toEqual(expectedMergedTypes);
  });

  test('handle should process geojson and log merged types excluding specified fields', async () => {
    const input = {
      geojson: {
        features: [
          { properties: { name: 'John', age: 30 } },
          { properties: { isActive: true, age: 25 } },
        ],
      },
    };

    const consoleSpy = jest.spyOn(console, 'log');
    await getObjectTypes.handle(input);

    const expectedMergedTypes = { age: 'number', isActive: 'boolean' };
    expect(consoleSpy).toHaveBeenCalledWith(expectedMergedTypes);

    consoleSpy.mockRestore();
  });
});
