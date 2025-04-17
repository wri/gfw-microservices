import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { OrganizationUsersAnalysisUsageExport as OrganizationUsersAnalysisUsageExportResponse } from '../queries';

/**
 * Check if the list was uploaded by EAPI
 * @param orgDbName - The name of the organization database
 * @param listId - The ID of the list
 * @returns {Promise<Boolean>} - Returns true if the list was uploaded by EAPI, false otherwise
 */
export async function checkIfListWasUploadByEAPI(
  orgDbName: string,
  listId: number
): Promise<Boolean> {
  try {
    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];

    const result = await SQLUtils.queryDB<OrganizationUsersAnalysisUsageExportResponse[]>(
      orgDbName,
      'getCheckIfListWasUploadByEAPI',
      parameters
    );
    if (result) {
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(error);
  }
}
