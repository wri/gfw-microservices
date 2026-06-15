import { EntitySchema } from 'typeorm';
import { organizationEntities, systemEntities, ListSchema, ListSchemaType } from '../entity';
import { createDatasourceConfig, ClientStoreConnection } from './typeORM.utils';
import { DataSource } from 'typeorm';
import { Mutex } from 'async-mutex';

describe('createDatasourceConfig', () => {
  const TEST_ENVIRONMENT = 'test';

  // Helper function to get connection map for testing
  async function getConnMap(type: string): Promise<Map<string, any>> {
    const [mapToInsert, release] = await ClientStoreConnection.getConnections(type);
    release();
    return mapToInsert;
  }

  beforeEach(async () => {
    // Reset environment variables before each test
    process.env.MSSQL_DATABASE = undefined;
    process.env.MSSQL_USERNAME = undefined;
    process.env.MSSQL_PASSWORD = undefined;
    process.env.MSSQL_HOSTNAME = undefined;
    process.env.MSSQL_PORT = undefined;
    // Clear all connections before each test
    await ClientStoreConnection.clearAllConnections();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns correct config for test environment', () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const config = createDatasourceConfig('default', 'someDB', ['Entity1', 'Entity2']);
    expect(config.database).toBe(':memory:');
    expect(config.synchronize).toBe(true);
    expect(config.logging).toBe(true);
  });

  it('returns correct config for non-test environment and specified database', () => {
    process.env.NODE_ENV = 'production';
    const config = createDatasourceConfig('someName', 'someDB', ['Entity1', 'Entity2']);
    expect(config.database).toBe('someDB');
    expect(config.synchronize).toBe(false);
    expect(config.logging).toBe(false);
  });

  it('returns correct config when entities are not provided', () => {
    process.env.NODE_ENV = 'QA';
    process.env.MSSQL_DATABASE = 'GFWPro';
    const config = createDatasourceConfig('default', '', []);
    expect(config.database).toBe('GFWPro');
    expect(config.entities).toEqual(expect.arrayContaining([]));
  });

  it('returns correct config for MSSQL database', () => {
    process.env.NODE_ENV = 'production';
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
    expect((await getConnMap('dynamic')).size).toBe(0);
    expect((await getConnMap('static')).size).toBe(1);
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
    expect((await getConnMap('dynamic')).size).toBe(1);
  });

  it('should reuse existing connection if available', async () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const clientStoreConnection = new ClientStoreConnection();

    // Create first connection
    const connection1 = await clientStoreConnection.getConnection('testDB');
    expect(connection1).toBeDefined();

    // Get the same connection again
    const connection2 = await clientStoreConnection.getConnection('testDB');
    expect(connection2).toBe(connection1);
  });

  it('should handle connection initialization error', async () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const clientStoreConnection = new ClientStoreConnection();

    // Mock DataSource.initialize to throw an error
    const initializeSpy = jest
      .spyOn(DataSource.prototype, 'initialize')
      .mockRejectedValue(new Error('Connection failed'));

    await expect(clientStoreConnection.getConnection('errorDB')).rejects.toThrow(
      'Connection failed'
    );
    expect(initializeSpy).toHaveBeenCalledTimes(3);
    initializeSpy.mockRestore();
  });

  it('should handle connection timeout', async () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const clientStoreConnection = new ClientStoreConnection();

    // Mock mutex.acquire to simulate timeout
    jest
      .spyOn(Mutex.prototype, 'acquire')
      .mockRejectedValueOnce(new Error('Error on try to establish connection'));

    await expect(clientStoreConnection.getConnection('timeoutDB')).rejects.toThrow(
      'Error on try to establish connection'
    );
  });

  it('should handle multiple concurrent connection requests', async () => {
    process.env.NODE_ENV = TEST_ENVIRONMENT;
    const clientStoreConnection = new ClientStoreConnection();

    // Create multiple connection requests simultaneously
    const promises = [
      clientStoreConnection.getConnection('concurrentDB'),
      clientStoreConnection.getConnection('concurrentDB'),
      clientStoreConnection.getConnection('concurrentDB'),
    ];

    const connections = await Promise.all(promises);

    // All connections should be the same instance
    expect(connections[0]).toBe(connections[1]);
    expect(connections[1]).toBe(connections[2]);
  });
});
