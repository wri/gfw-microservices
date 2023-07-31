import { SQLUtils } from '@wri-monorepos/sql';
import { DataSource } from 'typeorm';
import { StoredProcedureCommand } from './store-procedure.comand';
import { ParamStoreProcedure } from './store-procedure.params';

export class StoredProcedureCommandFactory {
  private readonly connection: SQLUtils | DataSource;

  constructor(connection: SQLUtils | DataSource) {
    this.connection = connection;
  }

  create(
    name: string,
    parameters: ParamStoreProcedure[],
  ): StoredProcedureCommand {
    return new StoredProcedureCommand(this.connection, name, parameters);
  }
}
