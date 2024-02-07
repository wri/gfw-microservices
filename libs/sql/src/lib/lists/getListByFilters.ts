import { GetListByFilters } from '../queries';
import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';

export async function getListByFilters(
  { listId, listName }: GetListByFilters,
  databaseName: string
) {
  try {
    const parameters = [
      { field: 'listName', type: sql.NVarChar, value: listName ?? null },
      { field: 'listId', type: sql.Int, value: listId ?? null },
    ];
    return await SQLUtils.queryDBFirstRow(databaseName, 'getListByFiltersQuery', parameters);
  } catch (error) {
    throw new Error(error);
  }
}
