
import { SQLUtils } from '@wri-monorepos/sql';
import * as sql from 'mssql';

/**
 * TODO: [GPV-4062]
 * This file takes presedence over this {@link {libs/sql/src/lib/lists/updateListsAnalysisStatus.ts}}
 */

interface UpdateListsAnalysisStatusParams {
  listId: number;
  errorInfo: string;
  status: number;
  options?: string;
}
/**
 * @summary updates ListsAnalysisStatus row for specific list + analysis_id combination
 */
export async function updateListsAnalysisStatus(
  databaseName: string,
  { listId, errorInfo, status, options }: UpdateListsAnalysisStatusParams
) {
  try {
    const parameters = [
      { field: 'ListID', type: sql.Int, value: listId },
      { field: 'ErrorInfo', type: sql.VarChar(2000), value: errorInfo },
      { field: 'Status', type: sql.Int, value: status },
      { field: 'options', type: sql.Int, value: options ?? null },
    ];
    return await SQLUtils.queryDBFirstRow<boolean>(
      databaseName,
      'updateListAnalysisStatus',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
