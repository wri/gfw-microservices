import * as sql from 'mssql';

export class ParamStoreProcedure {
  field: string;
  type: sql.ISqlType;
  value?: any;
}
