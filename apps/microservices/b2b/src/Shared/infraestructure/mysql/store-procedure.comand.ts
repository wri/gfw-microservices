import { Logger } from '@nestjs/common';
import { SQLUtils } from '@wri-monorepos/sql';
import { Command } from '../../domain/command';
import Result from '../../domain/result';
import ResultError from '../../domain/result/result.error';
import ResultPromise from '../../domain/result/result.promise';
import { ParamStoreProcedure } from './store-procedure.params';

type Error = {
  message: string;
};
export class StoredProcedureCommand implements Command {
  constructor(
    private readonly connection: SQLUtils,
    private readonly sql: string,
    private readonly parameters: ParamStoreProcedure[],
  ) {}

  private async connectToDatabase(database: string | null): Promise<void> {
    if (database) {
      await this.connection.connect(database);
    } else {
      await this.connection.connect();
    }
  }

  private async disconnectFromDatabase(): Promise<void> {
    await this.connection.disconnect();
  }

  private handleError(
    error: Error,
    queryOrSP: string,
    database: string,
  ): ResultError {
    Logger.error(`Error executing: ${queryOrSP}`, error, database);
    return new ResultError(
      error.message ? error.message : 'Error when executing stored procedure',
      500,
    );
  }

  async execute<T>(database: string | null = null) {
    try {
      const result = await SQLUtils.queryDB<T>(
        database ? database : this.connection.config.database,
        this.sql,
        this.parameters,
      );
      return Result.ok(result);
    } catch (error) {
      return Result.fail(this.handleError(error, this.sql, database));
    }
  }

  async getMany<T>(
    database: string | null = null,
  ): ResultPromise<T[] | undefined> {
    try {
      await this.connectToDatabase(database);

      const result = await this.connection.queryArray<T>(
        this.sql,
        this.parameters,
      );

      await this.disconnectFromDatabase();
      return Result.ok(result);
    } catch (error) {
      return Result.fail(this.handleError(error, this.sql, database));
    }
  }
}
