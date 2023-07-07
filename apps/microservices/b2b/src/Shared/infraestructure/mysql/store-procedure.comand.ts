import { Logger } from '@nestjs/common';
import { SQLUtils } from '@wri-monorepos/sql';
import { Command } from '../../domain/command';
import Result from '../../domain/result';
import ResultError from '../../domain/result/result.error';
import ResultPromise from '../../domain/result/result.promise';
import { ParamStoreProcedure } from './store-procedure.params';

export class StoredProcedureCommand implements Command {
  constructor(
    private readonly connection: SQLUtils,
    private readonly sql: string,
    private readonly parameters: ParamStoreProcedure[],
  ) {}

  async execute<T>(database: string | null = null): ResultPromise<T> {
    try {
      if (database) await this.connection.connect(database);
      else await this.connection.connect();

      const result = await this.connection.query<T>(this.sql, this.parameters);

      await this.connection.disconnect();
      return Result.ok(result);
    } catch (error) {
      Logger.error('Error Executing The Stored Proccedure', error, database);
      return Result.fail(
        new ResultError(
          error.message
            ? error.message
            : 'Error when executing stored procedure',
          500,
        ),
      );
    }
  }
}
