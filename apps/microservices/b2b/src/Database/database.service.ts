import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { DatabaseConfig, databaseConfig } from "../Shared/domain/database-provider/database.config";
import Result from "../Shared/domain/result";
import ResultError from "../Shared/domain/result/result.error";
import ResultPromise from "../Shared/domain/result/result.promise";

@Injectable()
export class DatabaseProvider {
  private readonly connections: Record<string, DataSource> = {};

  async getConnection(database: string): ResultPromise<DataSource> {
    if (!this.connections[database]) {
      try {
        const config: DatabaseConfig = databaseConfig[database];

        const connectionDb = new DataSource({
          type: 'mysql',
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          entities: [],
          synchronize: true,
        });

        this.connections[database] = await connectionDb.initialize();

        console.log(`Data Source ${database} has been initialized`);
        return Result.ok(this.connections[database]);
      } catch (error) {
        console.error(
          `Data Source ${database} initialization error`,
          error,
        );
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
