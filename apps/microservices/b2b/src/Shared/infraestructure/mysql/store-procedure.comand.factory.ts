import { SQLUtils } from '../../../../../../../libs/sql/src';
import { StoredProcedureCommand } from './store-procedure.comand';
import { ParamStoreProcedure } from './store-procedure.params';

export class StoredProcedureCommandFactory {
  private readonly connection: SQLUtils;

  constructor(connection: SQLUtils) {
    this.connection = connection;
  }

  create(
    name: string,
    parameters: ParamStoreProcedure[],
  ): StoredProcedureCommand {
    return new StoredProcedureCommand(this.connection, name, parameters);
  }
}
