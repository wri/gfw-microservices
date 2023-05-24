import { SQLUtils } from '@wri-monorepos/sql';
import { Command } from '../../domain/command';
import Result from '../../domain/result';
import ResultError from '../../domain/result/result.error';
import ResultPromise from '../../domain/result/result.promise';
import { ParamStoreProcedure } from './store-procedure.params';

export class StoredProcedureCommand implements Command {
  constructor(
    private readonly connection: SQLUtils,
    private readonly procedureName: string,
    private readonly parameters: ParamStoreProcedure[],
  ) {}

  async execute<T>(): ResultPromise<T> {
    try {
      await this.connection.connect();
      console.log(this.procedureName, this.parameters);
      const result = await this.connection.executeQuery<T>(
        this.procedureName,
        this.parameters,
      );
      console.log(result);
      await this.connection.disconnect();
      return Result.ok(result);
    } catch (error) {
      console.log('Error Executing The Stored Proccedure', error);
      return Result.fail(
        new ResultError('Error when executing stored procedure', 500),
      );
    }
  }
}
