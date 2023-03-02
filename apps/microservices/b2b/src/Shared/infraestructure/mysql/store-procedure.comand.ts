import { SQLUtils } from '../../../../../../../libs/sql/src';
import { Command } from '../../domain/command';
import { ParamStoreProcedure } from './store-procedure.params';

export class StoredProcedureCommand implements Command {
  constructor(
    private readonly connection: SQLUtils,
    private readonly procedureName: string,
    private readonly parameters: ParamStoreProcedure[],
  ) {}

  async execute(): Promise<any> {
    const result = this.connection.executeQuery(
      this.procedureName,
      this.parameters,
    );
    return result;
  }
}
