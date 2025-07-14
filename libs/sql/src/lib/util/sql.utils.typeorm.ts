// sql.utils.typeorm.ts

import { ClientStoreConnection } from './typeorm.utils';
import { ParameterType } from './types';
import { getQueryStr } from '../queries';
import { SQL_CONFIG } from '../config/config';

export class SQLUtilsTypeORM {
  private clientStoreConnection = new ClientStoreConnection();

  // Connect method (mostly just a passthrough to ClientStoreConnection)
  async connect(database: string = SQL_CONFIG.database) {
    return this.clientStoreConnection.getConnection(database);
  }

  // Run raw SQL query or stored procedure by name with parameter binding
  async runRawSingleQuery<T>(
    database: string,
    queryNameOrString: string,
    parameters?: ParameterType[]
  ): Promise<T[]> {
    const dataSource = await this.clientStoreConnection.getConnection(database);
    const isSystemQuery = database === SQL_CONFIG.database;

    const queryStr = getQueryStr(isSystemQuery, queryNameOrString);

    if (!queryStr) {
      throw new Error(`Query string not found for queryNameOrString: ${queryNameOrString}`);
    }

    // Map parameters to values array in order
    const paramValues = parameters?.map((param) => param.value) || [];

    // Run raw query, parameters passed as positional values (depends on your query)
    // If queries use named params, we will need a different mapping strategy
    const rawResult = await dataSource.query(queryStr, paramValues);
    return rawResult as T[];
  }

  // Executes a query and returns either a single row or all rows depending on result count
  async executeQuery<T>(
    database: string,
    queryName: string,
    parameters?: ParameterType[]
  ): Promise<T | T[]> {
    const allRows = await this.runRawSingleQuery<T>(database, queryName, parameters);
    if (!allRows || !allRows.length) {
      return undefined;
    }
    if (allRows.length === 1) {
      return allRows[0];
    }
    return allRows;
  }

  async disconnect(database: string) {
    const dataSource = await this.clientStoreConnection.getConnection(database);
    if (dataSource) {
      await dataSource.destroy(); // Close the connection
    }
  }

  static isSystemDatabase(databaseName: string): boolean {
    return databaseName === SQL_CONFIG.database;
  }

  // Static helper to mimic original static queryDB usage
  static async queryDB<T>(
    databaseName: string,
    queryName: string,
    parameters?: ParameterType[]
  ): Promise<T[]> {
    const sqlUtils = new SQLUtilsTypeORM();
    await sqlUtils.connect(databaseName);
    try {
      return await sqlUtils.runRawSingleQuery<T>(databaseName, queryName, parameters);
    } catch (error) {
      console.log('Error in queryDB', queryName.slice(0, 100), error);
      throw error;
    }
  }

  // Static helper to mimic original static queryDBFirstRow usage
  static async queryDBFirstRow<T>(
    databaseName: string,
    queryName: string,
    parameters?: ParameterType[]
  ): Promise<unknown> {
    const allRows = await SQLUtilsTypeORM.queryDB<T[]>(databaseName, queryName, parameters);
    return allRows?.[0];
  }
}
