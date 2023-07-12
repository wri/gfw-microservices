import * as sql from 'mssql';
import { get } from '../connectionpool';
import { ParameterType } from './types';
import { getQueryStr } from '../queries';
import { SQL_CONFIG } from '../config/config';

export class SQLUtils {
  config: sql.config;
  connection: sql.ConnectionPool;

  constructor(config: sql.config) {
    this.config = config;
  }

  async connect(database: string = this.config.database): Promise<void> {
    console.log(database);
    const config = { ...this.config, database };
    console.log(config);
    this.connection = await get(database, config); //sql.connect(this.config);
  }

  query<T>(query: string, parameters?: ParameterType[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queryArray<T>(query, parameters).then((result) => {
        if (result && Array.isArray(result) && result.length > 0) {
          resolve(result[0]);
        }
        resolve(undefined);
      });
    });
  }

  queryArray<T>(query: string, parameters?: ParameterType[]): Promise<Array<T>> {
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
            resolve(result.recordsets[0]);
          }
          resolve(undefined);
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });
  }

  executeQuery<T>(query: string, parameters?: ParameterType[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.executeQueryArray<T>(query, parameters).then((result) => {
        if (Number(result.length) > 1) {
          resolve(result as T);
        }
        resolve(result[0] as T);
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

  // setup connection, lookup query by name, query DB, disconnect
  static async queryDB<T>(
    databaseName: string,
    queryName: string,
    parameters?: ParameterType[]
  ): Promise<T> {
    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const isSystemQuery = databaseName === SQL_CONFIG.database;
      const queryStr = getQueryStr(isSystemQuery, queryName);
      const recordsets = await connection.query<T>(queryStr, parameters);
      connection.disconnect();
      return recordsets as T;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
