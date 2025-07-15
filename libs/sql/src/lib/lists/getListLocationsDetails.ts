import { checkIfListsHasIds } from '../queries';
import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';

export async function checkIfListsTableHasAnyIdTypes(databaseName: string, listId: number) {
  try {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];

    const resultSet = await SQLUtils.queryDBFirstRow<checkIfListsHasIds>(
      databaseName,
      'getCheckIfListsHasAnyIdType',
      parameters
    );
    const { list_has_ids } = resultSet;
    return Boolean(list_has_ids);
  } catch (error) {
    throw new Error(error);
  }
}

export async function getListLocationsDetails(databaseName: string, tablneName: string) {
  try {
    const parameters = [{ field: 'table_name', type: sql.NVarChar(sql.MAX), value: tablneName }];

    const resultSet = await SQLUtils.queryDBFirstRow<checkIfListsHasIds>(
      databaseName,
      'getIfListsHasAnyIdType',
      parameters
    );
    const { list_has_ids } = resultSet;
    return list_has_ids;
  } catch (error) {
    throw new Error(error);
  }
}
