import { SQLUtils } from '../../../../../libs/sql/src';
import { Command } from '../core/abstract/command';
import * as sql from 'mssql';

export class ParamStoreProcedure {
  field: string;
  type: sql.ISqlType;
  value: any;
}

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
