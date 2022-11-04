import { rejects } from 'assert';
import { config } from 'aws-sdk';
import * as sql from 'mssql';

export class SQLUtils {
  config: sql.config;
  connection: sql.ConnectionPool;

  constructor(config: sql.config) {
    this.config = config;
  }

  async connect() {
    this.connection = await sql.connect(this.config);
  }

  executeQuery<T>(query: string, parameters?: any[]): Promise<T> {
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
            resolve(result.recordsets[0][0]);
          }
          resolve(undefined);
        })
        .catch((errorMessage) => {
          reject(errorMessage);
        });
    });
  }

  executeQueryArray<T>(query: string, parameters?: any[]): Promise<Array<T>> {
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
