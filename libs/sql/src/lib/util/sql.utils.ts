import * as sql from 'mssql';
import { get } from '../connectionpool';
import { ParameterType } from './types';
import { getQueryStr } from '../queries';
import { SQL_CONFIG } from '../config/config';

export interface SqlParamType {
  field: string;
  type: sql.ISqlType;
  value: any;
}

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

  // mssql query function allows multiple queries to be executed in one call
  // and returns an array of recordsets (one per query).
  // We only use a single query per call, so we return the first recordset, which is itself an array of rows.
  runRawSingleQuery<T>(queryNameOrString: string, parameters?: ParameterType[]): Promise<Array<T>> {
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
            return resolve(result.recordsets[0] as Array<T>);
          }
          resolve(undefined); // this should never happen, but leaving it here just in case
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });
  }

  // all rows for given query, unless there is only one row, in which case return that row
  executeQuery<T>(queryName: string, parameters?: ParameterType[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.runRawSingleQuery<T>(queryName, parameters)
        .then((allRows) => {
          if (allRows === undefined) {
            return resolve(undefined);
          }
          if (Number(allRows.length) > 1) {
            return resolve(allRows as T); // all rows
          }
          resolve(allRows[0] as T);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  disconnect() {
    return this.connection.close();
  }

  static isSystemDatabase(databaseName: string): boolean {
    return databaseName === SQL_CONFIG.database;
  }

  // setup connection, lookup query by name, query DB, disconnect, return all rows for single query
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
      const allRows = await connection.runRawSingleQuery<T>(queryStr || queryName, parameters);
      connection.disconnect();
      return allRows as T;
    } catch (error) {
      connection.disconnect();
      // can't use logger because libs is included in both webserver and microservices
      console.log('Error in queryDB', queryName.slice(0, 100), error);
      throw error;
    }
  }

  // wrapper to return just the first row of the result set
  static async queryDBFirstRow<T>(
    databaseName: string,
    queryName: string,
    parameters?: ParameterType[]
  ): Promise<T> {
    const allRows = await SQLUtils.queryDB<T[]>(databaseName, queryName, parameters);
    return allRows ? (allRows[0] as T) : undefined;
  }
}
