import { getListColumns } from './getListColumns';

// Mock the utility functions
jest.mock('../../../../locations/js/utils/locationsTableUtils', () => ({
  checkValid: jest.fn((value) => value !== null && value !== undefined && value !== ''),
  formatDigit: jest.fn((value) => value),
  sortByDate: jest.fn(),
  sortByNone: jest.fn(),
}));

jest.mock('../../../../locations/js/utils/lists.utils', () => ({
  isDownloadDisabledForThisList: jest.fn(() => false),
  findArrIndex: jest.fn((arr, key, value) => arr.findIndex((item) => item[key] === value)),
}));

jest.mock('../../config/columns/id_type_columns', () => [
  { accessor: 'id', Header: 'ID' },
  { accessor: 'name', Header: 'Name' },
]);

// Mock Transifex
global.Transifex = {
  live: {
    translateText: jest.fn((text) => text),
  },
};

describe('getListColumns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when locationData is null', () => {
    const result = getListColumns(null, [], []);
    expect(result).toEqual([]);
  });

  it('should return empty array when locationData is undefined', () => {
    const result = getListColumns(undefined, [], []);
    expect(result).toEqual([]);
  });

  it('should return columns for basic location data', () => {
    const locationData = {
      id: '123',
      name: 'Test Location',
    };
    const customAttributes = [];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle Risk Level column', () => {
    const locationData = {
      'Risk Level': 'high',
    };
    const customAttributes = [];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    const riskLevelColumn = result.find((col) => col.accessor === 'Risk Level');
    expect(riskLevelColumn).toBeDefined();
    expect(riskLevelColumn.sortMethod).toBeDefined();
  });

  it('should handle geographic columns (State, Country)', () => {
    const locationData = {
      State: 'California',
      Country: 'USA',
    };
    const customAttributes = [];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    const stateColumn = result.find((col) => col.accessor === 'State');
    const countryColumn = result.find((col) => col.accessor === 'Country');

    expect(stateColumn).toBeDefined();
    expect(countryColumn).toBeDefined();
  });

  it('should handle coordinate columns (Latitude, Longitude)', () => {
    const locationData = {
      Latitude: 37.7749,
      Longitude: -122.4194,
    };
    const customAttributes = [];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    const latColumn = result.find((col) => col.accessor === 'Latitude');
    const lngColumn = result.find((col) => col.accessor === 'Longitude');

    expect(latColumn).toBeDefined();
    expect(lngColumn).toBeDefined();
  });

  it('should handle date columns (Start Date, End Date)', () => {
    const locationData = {
      'Start Date': '2023-01-01',
      'End Date': '2023-12-31',
    };
    const customAttributes = [];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    const startDateColumn = result.find((col) => col.accessor === 'Start Date');
    const endDateColumn = result.find((col) => col.accessor === 'End Date');

    expect(startDateColumn).toBeDefined();
    expect(endDateColumn).toBeDefined();
  });

  it('should filter out hidden columns', () => {
    const locationData = {
      version: '1.0',
      attributes: 'some attributes',
      validColumn: 'valid data',
    };
    const customAttributes = [];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    const versionColumn = result.find((col) => col.accessor === 'version');
    const attributesColumn = result.find((col) => col.accessor === 'attributes');

    expect(versionColumn).toBeUndefined();
    expect(attributesColumn).toBeUndefined();
  });

  it('should handle custom attributes columns with td-num className', () => {
    const locationData = {
      customField_1: 100, // Using underscore to avoid the general condition
      customField_2: 'custom value',
    };
    const customAttributes = ['customField_1', 'customField_2'];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    const customField1Column = result.find((col) => col.accessor === 'customField_1');
    const customField2Column = result.find((col) => col.accessor === 'customField_2');

    expect(customField1Column).toBeDefined();
    expect(customField1Column.className).toBe('td-num');
    expect(customField1Column.show).toBe(false);
    expect(customField1Column.Header).toBe('customField_1');

    expect(customField2Column).toBeDefined();
    expect(customField2Column.className).toBe('td-num');
    expect(customField2Column.show).toBe(false);
  });

  it('should prioritize general column condition over custom attributes', () => {
    const locationData = {
      regularField: 'regular value',
      customField_with_underscore: 100,
    };
    const customAttributes = ['regularField', 'customField_with_underscore'];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);

    const regularFieldColumn = result.find((col) => col.accessor === 'regularField');
    const customFieldColumn = result.find((col) => col.accessor === 'customField_with_underscore');

    expect(regularFieldColumn).toBeDefined();
    expect(regularFieldColumn.className).toBeUndefined();

    expect(customFieldColumn).toBeDefined();
    expect(customFieldColumn.className).toBe('td-num');
  });

  it('should render Risk Level Cell component correctly', () => {
    const locationData = {
      'Risk Level': 'high',
    };
    const customAttributes = [];
    const selectedLists = [{ id: 1 }];

    const result = getListColumns(locationData, customAttributes, selectedLists);
    const riskLevelColumn = result.find((col) => col.accessor === 'Risk Level');

    expect(riskLevelColumn).toBeDefined();
    expect(riskLevelColumn.Cell).toBeDefined();

    const { checkValid } = require('../../../../locations/js/utils/locationsTableUtils');

    checkValid.mockReturnValue(true);
    const cellWithValidValue = riskLevelColumn.Cell({ value: 'medium' });
    expect(checkValid).toHaveBeenCalledWith('medium');
    expect(cellWithValidValue.type).toBe('span');
    expect(cellWithValidValue.props.title).toBe('medium');
    expect(cellWithValidValue.props.children).toBe('medium');

    // Test Cell function with invalid value - should return '--'
    checkValid.mockReturnValue(false);
    const cellWithInvalidValue = riskLevelColumn.Cell({ value: null });
    expect(checkValid).toHaveBeenCalledWith(null);
    expect(cellWithInvalidValue).toBe('--');

    // Test Cell function with empty string
    checkValid.mockReturnValue(false);
    const cellWithEmptyValue = riskLevelColumn.Cell({ value: '' });
    expect(checkValid).toHaveBeenCalledWith('');
    expect(cellWithEmptyValue).toBe('--');

    // Test Cell function with undefined
    checkValid.mockReturnValue(false);
    const cellWithUndefinedValue = riskLevelColumn.Cell({ value: undefined });
    expect(checkValid).toHaveBeenCalledWith(undefined);
    expect(cellWithUndefinedValue).toBe('--');
  });
});
