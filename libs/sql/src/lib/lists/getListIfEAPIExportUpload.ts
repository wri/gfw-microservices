import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';
import { getListIfEAPIExportUploadExport } from '../queries';

/**
 * Check if the list was uploaded by EAPI
 * @param orgDbName - The name of the organization database
 * @param listId - The ID of the list
 * @returns {Promise<boolean>} - Returns true if the list was uploaded by EAPI, false otherwise
 */
export async function getListIfEAPIExportUpload(
  orgDbName: string,
  listId: number
): Promise<boolean> {
  try {
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];

    const result = await SQLUtils.queryDB<getListIfEAPIExportUploadExport>(
      orgDbName,
      'getListIfEAPIExportUploadQuery',
      parameters
    );
    if (result[0]?.ListId) {
      return true;
    }
    return false;
  } catch (error) {
    throw new Error(error);
  }
}
