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

  test('should merge new types into existing types when keys do not overlap', () => {
    const existingTypes = { name: 'string' };
    const newTypes = { age: 'number', isActive: 'boolean' };
    const expectedMergedTypes = { name: 'string', age: 'number', isActive: 'boolean' };
    expect(getObjectTypes.mergeTypes(existingTypes, newTypes)).toEqual(expectedMergedTypes);
  });

  test('should not overwrite existing types with the same key and type', () => {
    const existingTypes = { name: 'string' };
    const newTypes = { name: 'string', age: 'number' };
    const expectedMergedTypes = { name: 'string', age: 'number' };
    expect(getObjectTypes.mergeTypes(existingTypes, newTypes)).toEqual(expectedMergedTypes);
  });

  test('should concatenate types when existing and new types differ for the same key', () => {
    const existingTypes = { name: 'string' };
    const newTypes = { name: 'number', age: 'number' };
    const expectedMergedTypes = { name: 'string, number', age: 'number' };
    expect(getObjectTypes.mergeTypes(existingTypes, newTypes)).toEqual(expectedMergedTypes);
  });
});
