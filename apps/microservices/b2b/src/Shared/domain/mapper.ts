import { ParamStoreProcedure } from '../infraestructure/mysql/store-procedure.params';
import * as sql from 'mssql';

export abstract class GenericMapper {
  createStoreProcedureStringParam(
    params: Array<[string, any]>,
  ): ParamStoreProcedure[] {
    return params.map(
      ([field, value]): ParamStoreProcedure => ({
        field,
        type: sql.NVarChar(200),
        value,
      }),
    );
  }

  protected arrayWrapper<T, D>(mapCallback) {
    return (data: T[]) => {
      let response: D[] = [];
      if (Array.isArray(data)) {
        response = data.map((item) => mapCallback(item));
      } else {
        data && response.push(mapCallback(data));
      }
      return response;
    };
  }
}
