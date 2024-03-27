import { createDatasourceConfig } from './typeORM.utils';

describe('createDatasourceConfig', () => {
  const TEST_ENVIRONMENT = 'test'; // Assuming this constant is defined somewhere

  it('returns correct config for default environment and default name', () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const config = createDatasourceConfig('default', 'someDB', ['Entity1', 'Entity2']);
    expect(config.database).toBe('db.default.sqlite');
    expect(config.synchronize).toBe(true);
    expect(config.logging).toBe(true);
  });

  it('returns correct config for default environment and non-default name', () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const config = createDatasourceConfig('someName', 'someDB', ['Entity1', 'Entity2']);
    expect(config.database).toBe('db.sqlite');
    expect(config.synchronize).toBe(true);
    expect(config.logging).toBe(true);
  });

  it('returns correct config for non-test environment and specified database', () => {
    process.env.NODE_ENV = 'production'; // Or any non-test environment
    const config = createDatasourceConfig('someName', 'someDB', ['Entity1', 'Entity2']);
    expect(config.database).toBe('someDB');
    expect(config.synchronize).toBe(false);
    expect(config.logging).toBe(false);
  });

  it('returns correct config when entities are not provided', () => {
    process.env.NODE_ENV = 'QA'; // Or any non-test environment
    process.env.MSSQL_DATABASE = 'GFWPro';
    const config = createDatasourceConfig('default', '', []);
    expect(config.database).toBe('GFWPro');
    expect(config.entities).toEqual(expect.arrayContaining([]));
  });

  it('returns correct config for MSSQL database', () => {
    process.env.NODE_ENV = 'production'; // Or any non-test environment
    process.env.MSSQL_DATABASE = 'MSSQL_DB';
    const config = createDatasourceConfig('someName', 'MSSQL_DB', ['Entity1', 'Entity2']);
    expect(config.database).toBe('MSSQL_DB');
  });
});
