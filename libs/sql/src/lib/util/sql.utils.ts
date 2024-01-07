import * as sql from 'mssql';
import { get } from '../connectionpool';
import { ParameterType } from './types';
import { getQueryStr } from '../queries';
import { SQL_CONFIG } from '../config/config';

export class SQLUtils {
  config: sql.config;
  connection: sql.ConnectionPool;
  databaseName: string;

  constructor(config: sql.config) {
    this.config = config;
  }

  async connect(database: string = this.config.database): Promise<void> {
    const config = { ...this.config, database };
    this.databaseName = database;
    this.connection = await get(database, config); //sql.connect(this.config);
  }

  /**
   * This function runs a raw query against the database.
   *
   * @param query
   * @param parameters
   * @returns
   */
  query<T>(query: string, parameters?: ParameterType[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queryArray<T>(query, parameters)
        .then((result) => {
          if (result && Array.isArray(result) && result.length > 0) {
            resolve(result[0]);
          }
          resolve(undefined);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  queryArray<T>(queryNameOrString: string, parameters?: ParameterType[]): Promise<Array<T>> {
    const request = this.connection.request();

    if (parameters && Array.isArray(parameters)) {
      parameters.forEach((param) => {
        request.input(param.field, param.type, param.value);
      });
    }

    return new Promise((resolve, reject) => {
      const isSystemQuery = this.databaseName === SQL_CONFIG.database;
      const queryStr = getQueryStr(isSystemQuery, queryNameOrString);
      const dbPromise = queryStr ? request.query(queryStr) : request.execute(queryNameOrString);

      dbPromise
        .then((result: sql.IResult<T>) => {
          if (Number(result.recordsets.length) > 0) {
            resolve(result.recordsets[0] as Array<T>);
          }
          resolve(undefined);
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });
  }

  executeQuery<T>(queryName: string, parameters?: ParameterType[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queryArray<T>(queryName, parameters)
        .then((result) => {
          if (result === undefined) {
            resolve(undefined);
          }
          if (Number(result.length) > 1) {
            resolve(result as T);
          }
          resolve(result[0] as T);
        })
        .catch((error) => {
          reject(error);
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

  // This function is temporal, que queryDBArray always return the first recordset,
  // Need to discuss if we need to return all recordsets in the previous function or we need to have this function
  static async queryDBArray<T>(
    databaseName: string,
    queryName: string,
    parameters?: ParameterType[]
  ): Promise<T> {
    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      const isSystemQuery = databaseName === SQL_CONFIG.database;
      const queryStr = getQueryStr(isSystemQuery, queryName);
      const recordsets = await connection.queryArray<T>(queryStr, parameters);
      connection.disconnect();
      return recordsets as T;
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }

  static isSystemDatabase(databaseName: string): boolean {
    return databaseName === SQL_CONFIG.database;
  }
}
