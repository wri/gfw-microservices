import { DynamicModule, ForwardReference, Injectable, Type } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { organizationEntities, systemEntities } from '../entity';
import { Logger } from '@nestjs/common';
import { DataSource, EntitySchema } from 'typeorm';
import { withTimeout, Mutex } from 'async-mutex';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { MixedList } from 'typeorm/common/MixedList';

const TEST_ENVIRONMENT = 'test';
const CONNECTION_TYPE_MSSQL = 'mssql';
const CONNECTION_TYPE_SQLITE = 'sqlite';

const CLEAR_CONNECTION_TIMEOUT = {
  static: 60 * 60 * 1000, // 1 hour
  dynamic: 5 * 60 * 1000, // 5 minute
};

type CreateTypeOrmSystemModuleProps = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
};

export interface ConnectionCacheItem {
  connection: DataSource;
  timeout: NodeJS.Timeout;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const createDatasourceConfig = (
  name: string,
  database: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  entities: MixedList<Function | string | EntitySchema>
): TypeOrmModuleOptions => {
  const env = process.env.NODE_ENV;

  let databaseName = '';
  if (env === TEST_ENVIRONMENT && name === 'default') {
    databaseName = 'db.default.sqlite';
  } else if (env === TEST_ENVIRONMENT) {
    databaseName = 'db.sqlite';
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
const mutexWithTimeout = withTimeout(
  new Mutex(),
  20100, // longer than 15000 ms tedious/SQL Server timeout
  new Error('Error on try to establish connection')
);
const staticConnections: Map<string, ConnectionCacheItem> = new Map();
const dynamicConnections: Map<string, ConnectionCacheItem> = new Map();

@Injectable()
export class ClientStoreConnection {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getConnectionType(entities: MixedList<Function | string | EntitySchema>) {
    return entities === organizationEntities || entities === systemEntities ? 'static' : 'dynamic';
  }

  public static getConnections(type: string): Map<string, ConnectionCacheItem> {
    return type === 'dynamic' ? dynamicConnections : staticConnections;
  }

  async getConnection(
    database: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    entities: MixedList<Function | string | EntitySchema> = organizationEntities
  ): Promise<DataSource> {
    const entityType = ClientStoreConnection.getConnectionType(entities);
    const mapToInsert = ClientStoreConnection.getConnections(entityType);
    let connectionId = process.env.MSSQL_HOSTNAME + database;
    if (entityType === 'dynamic') {
      connectionId = `${connectionId}_${(entities as Array<unknown>)
        .map((entity: any) => entity.options?.name || entity.name || 'unknown')
        .join('')}`;
    }
    if (mapToInsert.has(connectionId)) {
      return mapToInsert.get(connectionId).connection;
    }

    const release = await mutexWithTimeout.acquire();
    try {
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

      mapToInsert.set(connectionId, {
        connection: dbConnection,
        timeout: setTimeout(() => {
          this.clearCache(connectionId, entityType);
        }, CLEAR_CONNECTION_TIMEOUT[entityType]),
      });

      Logger.log(`Data Source ${database} has been initialized`);
      return mapToInsert.get(connectionId).connection;
    } catch (error) {
      Logger.error(
        `Data Source ${database} initialization error on env: ${process.env.NODE_ENV}`,
        error.stack
      );
      throw new Error(`Data Source initialization error ${error.message}`);
    } finally {
      release();
    }
  }

  async clearCache(connectionId: string, entityType: string): Promise<void> {
    const mapToUse = ClientStoreConnection.getConnections(entityType);
    const cached = mapToUse.get(connectionId);
    if (cached) {
      mapToUse.delete(connectionId);
      await cached.connection.destroy();
    }
  }
}
