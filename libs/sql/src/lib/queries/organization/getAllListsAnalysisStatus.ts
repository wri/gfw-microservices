export const getAllListsAnalysisStatus = `
SELECT
    las.ListID AS listId,
    las.AnalysisID AS analysisId,
    las.Status AS status,
    las.ErrorInfo AS errorInfo,
    las.UpdateTime AS updateTime,
    las.options AS options
FROM dbo.[ListsAnalysisStatus] las
WHERE (@list_id IS NULL OR las.ListID = @list_id)
`;

export interface AllListsAnalysisStatusType {
  listId: number;
  analysisId: string;
  status: number;
  errorInfo: string;
  updateTime: Date;
  options: string;
}
