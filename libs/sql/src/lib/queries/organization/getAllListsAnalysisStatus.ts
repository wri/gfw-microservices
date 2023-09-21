export const getAllListsAnalysisStatus = `
SELECT
    las.ListID AS listId,
    las.AnalysisID AS analysisId,
    las.Status AS status,
    las.ErrorInfo AS errorInfo,
    las.UpdateTime AS updateTime
FROM dbo.[ListsAnalysisStatus] las
`;

export interface ListsAnalysisStatus {
  listID: number;
  analysisId: number;
  status: string;
  errorInfo: string | null; // Assuming ErrorInfo can be null
  updateTime: string;
}
