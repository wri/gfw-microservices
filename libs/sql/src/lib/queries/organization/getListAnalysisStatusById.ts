/**
 * Returns the rows of ListsAnalysisStatus matching the given listId
 * @ListID INT,
 */

export const getListAnalysisStatusById = `
SELECT
  las.ListID AS listId,
  las.AnalysisID AS analysisId,
  las.Status AS status,
  las.ErrorInfo AS errorInfo,
  las.UpdateTime AS updateTime,
  las.options AS options
FROM dbo.[ListsAnalysisStatus] las
WHERE (@ListID IS NULL OR las.ListID = @ListID)
`;

export interface ListsAnalysisStatusType {
  listId: number;
  analysisId: string;
  status: number;
  errorInfo: string;
  updateTime: Date;
  options: string;
}
