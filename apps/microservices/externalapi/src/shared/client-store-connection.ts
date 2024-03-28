import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TEST_ENVIRONMENT, CONNECTION_TYPE_SQLITE, CONNECTION_TYPE_MSSQL } from '../config';
import { ExternalUpload } from '../list-analysis/external-upload.entity';
import { ListsAnalysisStatus } from '../list-analysis/list-analysis-status.entity';
import { Lists } from '../Lists/lists.entity'

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
          entities: [ExternalUpload, ListsAnalysisStatus, Lists],
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
