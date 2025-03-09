import { EntitySchema } from 'typeorm';
import { organizationEntities, systemEntities, ListSchema, ListSchemaType } from '../entity';
import { createDatasourceConfig, ClientStoreConnection } from './typeORM.utils';

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

  it('should return correct connections type for given entities', async () => {
    expect(ClientStoreConnection.getConnectionType(systemEntities)).toBe('static');
    expect(ClientStoreConnection.getConnectionType(organizationEntities)).toBe('static');
    expect(ClientStoreConnection.getConnectionType([])).toBe('dynamic');
  });

  it('should create static connections when no entities are provided', async () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;

    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection('someDB');

    expect(connection).toBeDefined();
    expect(ClientStoreConnection.getConnections('dynamic').size).toBe(0);
    expect(ClientStoreConnection.getConnections('static').size).toBe(1);
  });

  it('should create dynamic connections when dynamic entity is provided', async () => {
    const listTable = 'myListTable';
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const clientStoreConnection = new ClientStoreConnection();
    const ListEntity = new EntitySchema<ListSchemaType>({
      ...ListSchema,
      name: listTable,
    });
    const connection = await clientStoreConnection.getConnection('someDB', [ListEntity]);

    expect(connection).toBeDefined();
    expect(ClientStoreConnection.getConnections('dynamic').size).toBe(1);
  });
});
