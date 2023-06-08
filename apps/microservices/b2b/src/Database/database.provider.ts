import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Result from '../Shared/domain/result';
import ResultError from '../Shared/domain/result/result.error';
import ResultPromise from '../Shared/domain/result/result.promise';
import entities from '../Shared/infraestructure/typeorm/entities';

@Injectable()
export class DatabaseProvider {
  private readonly connections: Record<string, DataSource> = {};

  getConnections() {
    return this.connections;
  }

  async getConnection(database: string): ResultPromise<DataSource> {
    Logger.log('Connection Exist', !!this.connections[database]);
    if (!this.connections[database]) {
      try {
        const connectionDb = new DataSource({
          type: 'mssql',
          host: process.env.MSSQL_HOSTNAME,
          port: parseInt(process.env.MSSQL_PORT, 10),
          username: process.env.MSSQL_USERNAME,
          password: process.env.MSSQL_PASSWORD,
          database: database,
          entities: entities,
          extra: {
            trustServerCertificate: true,
          },
        });

        this.connections[database] = await connectionDb.initialize();

        Logger.log(`Data Source ${database} has been initialized`);
        return Result.ok(this.connections[database]);
      } catch (error) {
        Logger.error(`Data Source ${database} initialization error`, error);
        return Result.fail(
          new ResultError(`Data Source initialization error`, 500),
        );
      }
    }
    return Result.ok(this.connections[database]);
  }

  async closeConnection(database?: string): Promise<void> {
    const targetDatabase = database;
    if (this.connections[targetDatabase]) {
      await this.connections[targetDatabase].destroy();
      delete this.connections[targetDatabase];
    }
  }
}
