import { Logger } from '@nestjs/common';
import { sqliteQuery, SQLUtils } from '@wri-monorepos/sql';
import { DataSource } from 'typeorm';
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
    private readonly connection: SQLUtils | DataSource,
    private readonly sql: string,
    private readonly parameters: ParamStoreProcedure[],
  ) {}

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
      let result: T;
      if (this.connection instanceof SQLUtils) {
        result = await SQLUtils.queryDB<T>(
          database ? database : this.connection.config.database,
          this.sql,
          this.parameters,
        );
        return Result.ok(result);
      } else if (process.env.NODE_ENV === 'test') {
        result = await sqliteQuery<T>(
          this.connection,
          this.sql,
          this.parameters,
          database,
        );
      }
      return Result.ok(result);
    } catch (error) {
      return Result.fail(this.handleError(error, this.sql, database));
    }
  }

  async getMany<T>(
    database: string | null = null,
  ): ResultPromise<T[] | undefined> {
    try {
      let result: T[];
      if (this.connection instanceof SQLUtils) {
        result = await SQLUtils.queryDBArray<T[]>(
          database ? database : this.connection.config.database,
          this.sql,
          this.parameters,
        );
      } else if (process.env.NODE_ENV === 'test') {
        result = await sqliteQuery<T[]>(
          this.connection,
          this.sql,
          this.parameters,
          database,
        );
      }
      return Result.ok(result);
    } catch (error) {
      return Result.fail(this.handleError(error, this.sql, database));
    }
  }
}
