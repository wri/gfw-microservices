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

const CLEAR_CONNECTION_FROM_CACHE_TIMEOUT = 60 * 60 * 1000;

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
const createDatasourceConfig = (
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
  } else if (env !== TEST_ENVIRONMENT && (database != '' || database != undefined)) {
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
    logging: true,
    entities: newEntities,
    username: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD,
    host: process.env.MSSQL_HOSTNAME,
    port: parseInt(process.env.MSSQL_PORT, 10),
    extra: {
      trustServerCertificate: true,
    },
  };
};

export class TypeOrmSystemModule {
  static create(props: CreateTypeOrmSystemModuleProps) {
    const { name, imports } = props;
    return TypeOrmModule.forRootAsync({
      name,
      imports: [...imports],
      useFactory: async () => {
        return createDatasourceConfig(name, '', systemEntities);
      },
    });
  }
}

@Injectable()
export class ClientStoreConnection {
  mutexWithTimeout = withTimeout(
    new Mutex(),
    1000,
    new Error('Error on try to establish connection')
  );

  private readonly connections: Map<string, ConnectionCacheItem> = new Map();

  async getConnection(database: string): Promise<DataSource> {
    const connectionId = process.env.MSSQL_HOSTNAME + database;

    if (this.connections.has(connectionId)) {
      return this.connections.get(connectionId).connection;
    }

    const release = await this.mutexWithTimeout.acquire();
    try {
      const datasourceConfig = createDatasourceConfig(
        database,
        database,
        organizationEntities
      ) as DataSourceOptions;
      const connectionDb = new DataSource(datasourceConfig);

      const orgConnection = await connectionDb.initialize();

      this.connections.set(connectionId, {
        connection: orgConnection,
        timeout: setTimeout(() => {
          this.clearCache(connectionId);
        }, CLEAR_CONNECTION_FROM_CACHE_TIMEOUT),
      });

      Logger.log(`Data Source ${database} has been initialized`);
      return this.connections.get(connectionId).connection;
    } catch (error) {
      throw new Error(`Data Source initialization error`);
    } finally {
      release();
    }
  }

  async clearCache(connectionId: string): Promise<void> {
    const cached = this.connections.get(connectionId);
    if (cached) {
      this.connections.delete(connectionId);
      await cached.connection.destroy();
    }
  }
}
