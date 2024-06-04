import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TEST_ENVIRONMENT, CONNECTION_TYPE_SQLITE, CONNECTION_TYPE_MSSQL } from '../config';
import { ExternalUpload } from '../list-analysis/external-upload.entity';
import { ListsAnalysisStatus } from '../list-analysis/list-analysis-status.entity';
import { Lists } from '../lists/lists.entity';
import { Env } from '../env';

export interface ConnectionCacheItem {
  connection: Promise<DataSource>;
  timeout: NodeJS.Timeout;
}

@Injectable()
export class ClientStoreConnection {
  private readonly connections: Map<string, ConnectionCacheItem> = new Map();

  constructor(private config: ConfigService<Env, true>) {}

  async getConnection(database: string): Promise<DataSource> {
    const connectionId = this.config.get('MSSQL_HOSTNAME') + database;
    const env = this.config.get('NODE_ENV', { infer: true });
    const password = this.config.get('MSSQL_PASSWORD', { infer: true });

    if (!this.connections.has(connectionId)) {
      try {
        const connectionDb = new DataSource({
          type: env === TEST_ENVIRONMENT ? CONNECTION_TYPE_SQLITE : CONNECTION_TYPE_MSSQL,
          database,
          synchronize: env === TEST_ENVIRONMENT,
          logging: true,
          entities: [ExternalUpload, ListsAnalysisStatus, Lists],
          username: this.config.get('MSSQL_USERNAME'),
          password,
          host: this.config.get('MSSQL_HOSTNAME'),
          port: this.config.get('MSSQL_PORT'),
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
