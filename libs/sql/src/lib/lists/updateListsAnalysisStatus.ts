import { SQLUtils } from '../util/sql.utils';
import * as sql from 'mssql';

interface UpdateListsAnalysisStatusParams {
  listId: number;
  analysisId?: string;
  errorInfo: string;
  status: number;
}
/**
 * @summary updates ListsAnalysisStatus row for specific list + analysis_id combination
 */
export async function updateListsAnalysisStatus(
  databaseName: string,
  { listId, analysisId, errorInfo, status }: UpdateListsAnalysisStatusParams
) {
  try {
    const parameters = [
      { field: 'ListID', type: sql.Int, value: listId },
      { field: 'AnalysisID', type: sql.VarChar(30), value: analysisId || null },
      { field: 'ErrorInfo', type: sql.VarChar(2000), value: errorInfo },
      { field: 'Status', type: sql.Int, value: status },
    ];
    return await SQLUtils.queryDBFirstRow<Boolean>(
      databaseName,
      'updateListAnalysisStatus',
      parameters
    );
  } catch (error) {
    throw new Error(error);
  }
}
