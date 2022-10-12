import * as sql from 'mssql';

export class SQLParam {
  field: string;
  type: (() => sql.ISqlType) | sql.ISqlType;
  value: any;
}

export class StoredProcedureOutput {
  data: any;
  output: any;
}
