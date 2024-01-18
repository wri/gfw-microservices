import * as queries from './index';

describe('SQL queries', () => {
  it('can find an org query', () => {
    const queryStr = queries.getQueryStr(false, 'getListNameSchema');
    expect(queryStr).toContain(
      'SELECT id, user_id, list_name, list_table_name, list_analysis_table_name FROM Lists WHERE id = @list_id'
    );
  });

  it('can find a systemDB query', () => {
    const queryStr = queries.getQueryStr(true, 'getGfwLists');
    expect(queryStr).toContain('SELECT * FROM GFWLists');
  });

  it('bad query name fails', () => {
    const queryStr = queries.getQueryStr(false, 'foo1234');
    expect(queryStr).toBeNull();
  });

  it('can find result type', () => {
    expect(queries.ListNameSchema).toBeDefined();
  });
});
