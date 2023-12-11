import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { organizationEntities, systemEntities } from '../entity';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

const TEST_ENVIRONMENT = 'test';
const CONNECTION_TYPE_MSSQL = 'mssql';
const CONNECTION_TYPE_SQLITE = 'sqlite';

type CreateTypeOrmModuleProps = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
};

export function createTypeOrmModule(props: CreateTypeOrmModuleProps) {
  const { name, imports } = props;
  return TypeOrmModule.forRootAsync({
    name,
    imports: [ConfigModule, ...imports],
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const env = config.get<string>('NODE_ENV');
      return {
        name,
        type: env === TEST_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL,
        database:
          env === TEST_ENVIRONMENT
            ? name === 'default'
              ? 'db.default.sqlite'
              : 'db.sqlite'
            : config.get<string>('MSSQL_DATABASE'),
        username: config.get<string>('MSSQL_USERNAME'),
        password: config.get<string>('MSSQL_PASSWORD'),
        synchronize: env === TEST_ENVIRONMENT,
        logging: true,
        entities: systemEntities,
        host: config.get<string>('MSSQL_HOSTNAME'),
        port: parseInt(config.get<string>('MSSQL_PORT'), 10),
        extra: {
          trustServerCertificate: true,
        },
      };
    },
  });
}

export interface ConnectionCacheItem {
  connection: Promise<DataSource>;
  timeout: NodeJS.Timeout;
}

@Injectable()
export class ClientStoreConnection {
  constructor(private config: ConfigService) {}
  private readonly connections: Map<string, ConnectionCacheItem> = new Map();
  async getConnection(database: string): Promise<DataSource> {
    const connectionId = process.env.MSSQL_HOSTNAME + database;
    const env = this.config.get<string>('NODE_ENV');
    if (!this.connections.has(connectionId)) {
      try {
        const connectionDb = new DataSource({
          type: env === TEST_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL,
          database,
          synchronize: env === TEST_ENVIRONMENT,
          logging: true,
          entities: organizationEntities,
          username: this.config.get<string>('MSSQL_USERNAME'),
          password: this.config.get<string>('MSSQL_PASSWORD'),
          host: this.config.get<string>('MSSQL_HOSTNAME'),
          port: parseInt(this.config.get<string>('MSSQL_PORT'), 10),
          extra: {
            trustServerCertificate: true,
          },
        });

        this.connections[connectionId] = await connectionDb.initialize();

        this.connections.set(connectionId, {
          timeout: setTimeout(() => {
            this.clearCache(connectionId);
          }, 60000),
          connection: this.connections[connectionId],
        });

        Logger.log(`Data Source ${database} has been initialized`);
        return this.connections.get(connectionId).connection;
      } catch (error) {
        Logger.error(`Data Source ${database} initialization error on env: ${env}`, error);
        throw new Error(`Data Source initialization error`);
        1;
      }
    }

    return this.connections.get(connectionId).connection;
  }

  clearCache = async (connectionId: string): Promise<void> => {
    const cached = this.connections.get(connectionId);
    if (cached) {
      this.connections.delete(connectionId);
      (await cached.connection).destroy();
    }
  };
}
