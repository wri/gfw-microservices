export const getListsAnalysisStatus = `
SELECT
    las.ListID,
    las.AnalysisID,
    las.Status,
    las.ErrorInfo,
    las.UpdateTime
FROM dbo.[ListsAnalysisStatus] las
`;

export interface ListsAnalysisStatus {
  ListID: number;
  AnalysisID: number;
  Status: string;
  ErrorInfo: string | null; // Assuming ErrorInfo can be null
  UpdateTime: string;
}
