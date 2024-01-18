import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { SQL_CONFIG } from '../config/config';

export async function getListLocationsCount(listId: number) {
  try {
    const { database: databaseName } = SQL_CONFIG;
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];
    const recordSet = await SQLUtils.queryDB<{ list_locations_count: number }>(
      databaseName,
      'getListLocationsCountQuery',
      parameters
    );
    const { list_locations_count: listLocationsCount } = recordSet;
    return listLocationsCount;
  } catch (error) {
    throw new Error(error);
  }
}
