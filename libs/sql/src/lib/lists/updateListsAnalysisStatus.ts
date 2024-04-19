import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';

interface UpdateListsAnalysisStatusParams {
  listId: number;
  errorInfo: string;
  status: number;
}
/**
 * @summary updates ListsAnalysisStatus row for specific list + analysis_id combination
 */
export async function updateListsAnalysisStatus(
  databaseName: string,
  { listId, errorInfo, status }: UpdateListsAnalysisStatusParams
) {
  try {
    const parameters = [
      { field: 'ListID', type: sql.Int, value: listId },
      { field: 'ErrorInfo', type: sql.VarChar(2000), value: errorInfo },
      { field: 'Status', type: sql.Int, value: status },
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
