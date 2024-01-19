import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';

export async function getListLocationsCountById(listId: number, databaseName: string) {
  try {
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];
    const recordSet = await SQLUtils.queryDBFirstRow<{ listLocationsCount: number }>(
      databaseName,
      'getListLocationsCountQueryById',
      parameters
    );
    const { listLocationsCount } = recordSet;
    return listLocationsCount;
  } catch (error) {
    throw new Error(error);
  }
}
