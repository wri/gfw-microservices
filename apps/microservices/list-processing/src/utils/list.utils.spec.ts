import { createListNameSchema } from './list.utils';

describe('createListNameSchema', () => {
  it('should create correct schema for simple list name', () => {
    const result = createListNameSchema('testlist');
    expect(result).toEqual({
      list_table: 'list-testlist',
      analysis_table: 'analysis-testlist',
    });
  });

  it('should handle spaces in list name', () => {
    const result = createListNameSchema('test list');
    expect(result).toEqual({
      list_table: 'list-testlist',
      analysis_table: 'analysis-testlist',
    });
  });

  it('should convert uppercase to lowercase', () => {
    const result = createListNameSchema('TEST LIST');
    expect(result).toEqual({
      list_table: 'list-testlist',
      analysis_table: 'analysis-testlist',
    });
  });

  it('should handle multiple spaces', () => {
    const result = createListNameSchema('test   list   name');
    expect(result).toEqual({
      list_table: 'list-testlistname',
      analysis_table: 'analysis-testlistname',
    });
  });

  it('should handle list names with numbers', () => {
    const result = createListNameSchema('list 2024 v2');
    expect(result).toEqual({
      list_table: 'list-list2024v2',
      analysis_table: 'analysis-list2024v2',
    });
  });

  it('should handle special characters', () => {
    const result = createListNameSchema('test-list!@#$%^&*()');
    expect(result).toEqual({
      list_table: 'list-test-list!@#$%^&*()',
      analysis_table: 'analysis-test-list!@#$%^&*()',
    });
  });
});
