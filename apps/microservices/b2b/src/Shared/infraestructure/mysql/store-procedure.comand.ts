import { SQLUtils } from '../../../../../../../libs/sql/src';
import { Command } from '../../domain/command';
import { ParamStoreProcedure } from './store-procedure.params';

export class StoredProcedureCommand implements Command {
  constructor(
    private readonly connection: SQLUtils,
    private readonly procedureName: string,
    private readonly parameters: ParamStoreProcedure[],
  ) {}

  async execute<T>(): Promise<T> {
    try {
      await this.connection.connect();
      console.log(this.procedureName, this.parameters);
      const result = await this.connection.executeQuery<T>(
        this.procedureName,
        this.parameters,
      );
      console.log('Arrived');
      await this.connection.disconnect();
      return result;
    } catch (error) {
      console.log(error);
      throw new Error('Error while executing stored procedure');
    }
  }
}
