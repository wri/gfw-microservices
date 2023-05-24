import { ParamStoreProcedure } from '../infraestructure/mysql/store-procedure.params';
import * as sql from 'mssql';

export abstract class GenericMapper {
  createStoreProcedureStringParam(
    params: Array<[string, unknown]>,
  ): ParamStoreProcedure[] {
    return params.map(
      ([field, value]): ParamStoreProcedure => ({
        field,
        type: sql.NVarChar(200),
        value,
      }),
    );
  }
}
