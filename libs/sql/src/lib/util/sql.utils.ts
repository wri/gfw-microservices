import * as sql from 'mssql';
import { get } from '../connectionpool';
import { ParameterType } from './types';

export class SQLUtils {
  config: sql.config;
  connection: sql.ConnectionPool;

  constructor(config: sql.config) {
    this.config = config;
  }

  async connect(database: string = this.config.database): Promise<void> {
    const config = {...this.config, database};
    this.connection = await get(database, config); //sql.connect(this.config);
  }

  query<T>(query: string, parameters?: ParameterType[]): Promise<T> {
    const request = this.connection.request();

    if (parameters && Array.isArray(parameters)) {
      parameters.forEach((param) => {
        request.input(param.field, param.type, param.value);
      });
    }

    return new Promise((resolve, reject) => {
      request
        .query(query)
        .then((result: sql.IProcedureResult<sql.IRecordSet<T>>) => {
          if (Number(result.recordsets.length) > 0) {
            resolve(result.recordsets[0][0]);
          }
          resolve(undefined);
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });
  }

  executeQuery<T>(query: string, parameters?: ParameterType[]): Promise<T> {
    const request = this.connection.request();

    if (parameters && Array.isArray(parameters)) {
      parameters.forEach((param) => {
        request.input(param.field, param.type, param.value);
      });
    }

    return new Promise((resolve, reject) => {
      request
        .execute(query)
        .then((result: sql.IProcedureResult<sql.IRecordSet<T>>) => {
          if (Number(result.recordsets.length) > 0) {
            if (Number(result.recordsets[0].length) > 1) {
              resolve(result.recordsets[0] as T);
            }
            resolve(result.recordsets[0][0] as T);
          }
          resolve(undefined);
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });
  }

  executeQueryArray<T>(query: string, parameters?: ParameterType[]): Promise<Array<T>> {
    const request = this.connection.request();

    if (parameters && Array.isArray(parameters)) {
      parameters.forEach((param) => {
        request.input(param.field, param.type, param.value);
      });
    }

    return new Promise((resolve, reject) => {
      request
        .execute(query)
        .then((result: sql.IProcedureResult<sql.IRecordSet<T>>) => {
          if (Number(result.recordsets.length) > 0) {
            resolve(result.recordsets[0]);
          }
          resolve(undefined);
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });
  }

  disconnect() {
    return this.connection.close();
  }
}
