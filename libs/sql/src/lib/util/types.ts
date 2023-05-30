import * as sql from 'mssql';

type ParameterType = {
  field: string;
  type: sql.ISqlType | sql.ISqlTypeFactoryWithNoParams;
  value?: unknown;
};

export { ParameterType };
