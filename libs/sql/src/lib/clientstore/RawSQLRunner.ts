/**
 * Create a object that allow to run raw SQL queries
 */
import { SQLUtils } from '../util/sql.utils';
import { Injectable } from '@nestjs/common';

import { SQL_CONFIG } from '../config/config';

@Injectable()
export class RawSQLRunner {
  /**
   * 
   * @param databaseName - Client store database where the query will be run
   * @param SQL - SQL query to run
   * @returns void
   **/
  async run(
    databaseName: string,
    SQL: string
  ) {
    const connection = new SQLUtils({ ...SQL_CONFIG, database: databaseName });
    await connection.connect();
    try {
      await connection.query(SQL);
      connection.disconnect();
    } catch (error) {
      connection.disconnect();
      throw new Error(error);
    }
  }
}
