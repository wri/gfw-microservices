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
  static: 10 * 60 * 1000, // 10 minutes
  dynamic: 1 * 60 * 1000, // 1 minute
};

type CreateTypeOrmSystemModuleProps = {
  name: string;
  imports?: Array<Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
};

export interface ConnectionCacheItem {
  connection: DataSource;
  timeout: NodeJS.Timeout;
  createdAt: number;
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
      connectionTimeout: 30000,
      requestTimeout: 30000,
      options: {
        trustServerCertificate: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    },
  };
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
  35000, // longer than 30000 ms connectionTimeout
  new Error('Error on try to establish connection')
);
const staticConnections: Map<string, ConnectionCacheItem> = new Map();
const dynamicConnections: Map<string, ConnectionCacheItem> = new Map();
const MAX_CONNECTION_RETRIES = 3;

const getNonNegativeInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return parsedValue;
};

const getRetryConfig = () => {
  const defaultBaseDelay = process.env.NODE_ENV === TEST_ENVIRONMENT ? 0 : 1000;
  const defaultJitter = process.env.NODE_ENV === TEST_ENVIRONMENT ? 0 : 500;

  return {
    baseDelayMs: getNonNegativeInteger(
      process.env.MSSQL_CONNECTION_RETRY_BASE_DELAY_MS,
      defaultBaseDelay
    ),
    jitterMs: getNonNegativeInteger(process.env.MSSQL_CONNECTION_RETRY_JITTER_MS, defaultJitter),
  };
};

const getErrorDetails = (error: unknown): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
};

@Injectable()
export class ClientStoreConnection {
  private readonly logger = new Logger(ClientStoreConnection.name);

  private refreshCachedConnectionTimeout(
    cached: ConnectionCacheItem,
    connectionId: string,
    entityType: string
  ): void {
    clearTimeout(cached.timeout);
    const timeout = setTimeout(() => {
      this.clearCache(connectionId, entityType).catch((error) => {
        const errorDetails = getErrorDetails(error);
        Logger.error(
          `Error clearing cache for ${connectionId}: ${errorDetails.message}`,
          errorDetails.stack
        );
      });
    }, CLEAR_CONNECTION_TIMEOUT[entityType]);
    cached.timeout = timeout;
  }

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
      const errorDetails = getErrorDetails(error);
      Logger.error(`Error acquiring mutex: ${errorDetails.message}`, errorDetails.stack);
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
        .map((entity) => {
          if (typeof entity === 'string') {
            return entity;
          }

          const typedEntity = entity as EntitySchema<unknown> & Type<unknown>;
          return typedEntity.options?.name || typedEntity.name || 'unknown';
        })
        .join('')}`;
    }
    const [mapToInsert, release] = await ClientStoreConnection.getConnections(entityType);
    try {
      if (mapToInsert.has(connectionId)) {
        const cached = mapToInsert.get(connectionId);
        const connectionAgeMs = Date.now() - cached.createdAt;
        this.logger.debug(
          `Data Source ${connectionId} cache hit on env: ${process.env.NODE_ENV} (age=${connectionAgeMs}ms)`
        );
        // reset timeout from now to prevent destroying connection while it's being used
        this.refreshCachedConnectionTimeout(cached, connectionId, entityType);
        return mapToInsert.get(connectionId).connection;
      }
      // recheck if connection was created while waiting for mutex
      if (mapToInsert.has(connectionId)) {
        const cached = mapToInsert.get(connectionId);
        const connectionAgeMs = Date.now() - cached.createdAt;
        this.logger.debug(
          `Data Source ${connectionId} cache hit after mutex wait on env: ${process.env.NODE_ENV} (age=${connectionAgeMs}ms)`
        );
        // reset timeout here too because this caller is actively using the connection
        this.refreshCachedConnectionTimeout(cached, connectionId, entityType);
        return mapToInsert.get(connectionId).connection;
      }
      this.logger.debug(
        `Data Source ${connectionId} cache miss on env: ${process.env.NODE_ENV}; initializing new connection`
      );
      const datasourceConfig = createDatasourceConfig(
        database,
        database,
        entities
      ) as DataSourceOptions;
      const retryConfig = getRetryConfig();

      let dbConnection: DataSource | undefined;
      for (let attempt = 1; attempt <= MAX_CONNECTION_RETRIES; attempt++) {
        try {
          const connectionDb = new DataSource(datasourceConfig);
          dbConnection = await connectionDb.initialize();
          break;
        } catch (initError) {
          const errorMessage = initError instanceof Error ? initError.message : String(initError);
          if (attempt < MAX_CONNECTION_RETRIES) {
            const backoffDelayMs =
              retryConfig.baseDelayMs * 2 ** (attempt - 1) +
              Math.floor(Math.random() * retryConfig.jitterMs);
            Logger.warn(
              `Data Source ${database} initialization attempt ${attempt}/${MAX_CONNECTION_RETRIES} failed on env: ${process.env.NODE_ENV}: ${errorMessage}. Retrying in ${backoffDelayMs}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, backoffDelayMs));
          } else {
            Logger.warn(
              `Data Source ${database} initialization attempt ${attempt}/${MAX_CONNECTION_RETRIES} failed on env: ${process.env.NODE_ENV}: ${errorMessage}. No retries remaining`
            );
            throw initError;
          }
        }
      }

      if (!dbConnection) {
        throw new Error(
          `Data Source ${database} could not be initialized after ${MAX_CONNECTION_RETRIES} attempts`
        );
      }

      const timeout = setTimeout(() => {
        this.clearCache(connectionId, entityType).catch((error) => {
          const errorDetails = getErrorDetails(error);
          Logger.error(
            `Error clearing cache for ${connectionId}: ${errorDetails.message}`,
            errorDetails.stack
          );
        });
      }, CLEAR_CONNECTION_TIMEOUT[entityType]);

      mapToInsert.set(connectionId, {
        connection: dbConnection,
        timeout,
        createdAt: Date.now(),
      });

      Logger.log(`Data Source ${connectionId} has been initialized`);
      return mapToInsert.get(connectionId).connection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(
        `Data Source ${database} initialization error on env: ${process.env.NODE_ENV}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
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
            const errorDetails = getErrorDetails(error);
            Logger.error(
              `Error destroying connection ${connectionId}: ${errorDetails.message}`,
              errorDetails.stack
            );
          });
        }
      }
    } finally {
      release();
    }
  }
}
