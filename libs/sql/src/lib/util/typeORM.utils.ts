import { DynamicModule, ForwardReference, Injectable, Type } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { organizationEntities, systemEntities } from '../entity';
import { Logger } from '@nestjs/common';
import { DataSource, EntitySchema } from 'typeorm';
import { withTimeout, Mutex } from 'async-mutex';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { MixedList } from 'typeorm/common/MixedList';
import { clearTimeout } from 'timers';

const TEST_ENVIRONMENT = 'test';
const CONNECTION_TYPE_MSSQL = 'mssql';
const CONNECTION_TYPE_SQLITE = 'sqlite';

const CLEAR_CONNECTION_TIMEOUT = {
  static: 60 * 60 * 1000, // 1 hour
  dynamic: 5 * 60 * 1000, // 5 minute
};

type CreateTypeOrmSystemModuleProps = {
  name: string;
  imports?: Array<Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
};

export interface ConnectionCacheItem {
  connection: DataSource;
  timeout: NodeJS.Timeout;
}

type EntityType = Type<unknown> | string | EntitySchema<unknown>;

export const createDatasourceConfig = (
  name: string,
  database: string,
  entities: MixedList<EntityType>
): TypeOrmModuleOptions => {
  const env = process.env.NODE_ENV;

  let databaseName = '';
  if (env === TEST_ENVIRONMENT) {
    databaseName = ':memory:'; // Always use in-memory database for tests
  } else if (env !== TEST_ENVIRONMENT && database !== '' && database !== undefined) {
    databaseName = database;
  } else {
    databaseName = process.env.MSSQL_DATABASE;
  }

  let newEntities = entities;
  if (entities === undefined || entities.length === 0) {
    if (database === 'gfwpro') {
      newEntities = systemEntities;
    } else {
      newEntities = organizationEntities;
    }
  }

  const type = env === TEST_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL;
  return {
    name,
    type,
    database: databaseName,
    synchronize: env === TEST_ENVIRONMENT,
    logging: env === TEST_ENVIRONMENT,
    entities: newEntities,
    username: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    host: process.env.MSSQL_HOSTNAME,
    dropSchema: env === TEST_ENVIRONMENT,
    port: parseInt(process.env.MSSQL_PORT, 10),
    extra: {
      trustServerCertificate: true,
      options: {
        connectTimeout: 30000,
        requestTimeout: 30000,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    },
  } as TypeOrmModuleOptions;
};

export class TypeOrmSystemModule {
  static create(props: CreateTypeOrmSystemModuleProps) {
    const { name, imports = [] } = props;
    return TypeOrmModule.forRootAsync({
      name,
      imports: [...imports],
      useFactory: async () => {
        return createDatasourceConfig(name, '', systemEntities);
      },
    });
  }
}

// singletons to avoid multiple connections to the same database
// NOTE: mutex must be used when accessing these maps
const mutexWithTimeout = withTimeout(
  new Mutex(),
  20100, // longer than 15000 ms tedious/SQL Server timeout
  new Error('Error on try to establish connection')
);
const staticConnections: Map<string, ConnectionCacheItem> = new Map();
const dynamicConnections: Map<string, ConnectionCacheItem> = new Map();

@Injectable()
export class ClientStoreConnection {
  public static getConnectionType(entities: MixedList<EntityType>) {
    return entities === organizationEntities || entities === systemEntities ? 'static' : 'dynamic';
  }

  // Returns a map of connections
  // Also, acquire mutex and return release function to ensure all callers handle mutex
  public static async getConnections(
    type: string
  ): Promise<[Map<string, ConnectionCacheItem>, () => void]> {
    const mapToUse = type === 'dynamic' ? dynamicConnections : staticConnections;
    try {
      const release = await mutexWithTimeout.acquire();
      return [mapToUse, release];
    } catch (error) {
      Logger.error('Error acquiring mutex:', error.message, error);
      throw error;
    }
  }

  public static async clearAllConnections(): Promise<void> {
    const release = await mutexWithTimeout.acquire();
    try {
      // Clear static connections
      for (const [connectionId, cached] of staticConnections.entries()) {
        staticConnections.delete(connectionId);
        clearTimeout(cached.timeout);
        if (cached.connection.isInitialized) {
          await cached.connection.destroy();
        }
      }

      // Clear dynamic connections
      for (const [connectionId, cached] of dynamicConnections.entries()) {
        dynamicConnections.delete(connectionId);
        clearTimeout(cached.timeout);
        if (cached.connection.isInitialized) {
          await cached.connection.destroy();
        }
      }
    } finally {
      release();
    }
  }

  async getConnection(database: string, entities?: MixedList<EntityType>): Promise<DataSource> {
    if (!entities) {
      entities = database === 'gfwpro' ? systemEntities : organizationEntities;
    }
    const entityType = ClientStoreConnection.getConnectionType(entities);
    let connectionId = process.env.MSSQL_HOSTNAME + database;
    if (entityType === 'dynamic') {
      connectionId = `${connectionId}_${(entities as Array<unknown>)
        .map((entity: any) => entity.options?.name || entity.name || 'unknown')
        .join('')}`;
    }
    const [mapToInsert, release] = await ClientStoreConnection.getConnections(entityType);
    try {
      if (mapToInsert.has(connectionId)) {
        const cached = mapToInsert.get(connectionId);
        // reset timeout from now to prevent destroying connection while it's being used
        clearTimeout(cached.timeout);
        const timeout = setTimeout(() => {
          this.clearCache(connectionId, entityType).catch((error) => {
            Logger.error(`Error clearing cache for ${connectionId}:`, error);
          });
        }, CLEAR_CONNECTION_TIMEOUT[entityType]);
        cached.timeout = timeout;
        return mapToInsert.get(connectionId).connection;
      }
      // recheck if connection was created while waiting for mutex
      if (mapToInsert.has(connectionId)) {
        return mapToInsert.get(connectionId).connection;
      }
      const datasourceConfig = createDatasourceConfig(
        database,
        database,
        entities
      ) as DataSourceOptions;
      const connectionDb = new DataSource(datasourceConfig);
      const dbConnection = await connectionDb.initialize();

      const timeout = setTimeout(() => {
        this.clearCache(connectionId, entityType).catch((error) => {
          Logger.error(`Error clearing cache for ${connectionId}:`, error);
        });
      }, CLEAR_CONNECTION_TIMEOUT[entityType]);

      mapToInsert.set(connectionId, {
        connection: dbConnection,
        timeout,
      });

      Logger.log(`Data Source ${connectionId} has been initialized`);
      return mapToInsert.get(connectionId).connection;
    } catch (error) {
      Logger.error(
        `Data Source ${database} initialization error on env: ${process.env.NODE_ENV}`,
        error.stack
      );
      return null;
    } finally {
      release();
    }
  }

  async clearCache(connectionId: string, entityType: string): Promise<void> {
    const [mapToUse, release] = await ClientStoreConnection.getConnections(entityType);
    try {
      const cached = mapToUse.get(connectionId);
      if (cached) {
        clearTimeout(cached.timeout);
        mapToUse.delete(connectionId);
        if (cached.connection.isInitialized) {
          // start destroying connection, but do not wait for it because it hangs sometimes
          cached.connection.destroy().catch((error) => {
            Logger.error(`Error destroying connection ${connectionId}:`, error.message, error);
          });
        }
      }
    } finally {
      release();
    }
  }
}
