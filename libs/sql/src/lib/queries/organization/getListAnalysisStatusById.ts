export const getListAnalysisStatusById = `
SELECT
  las.ListID AS listId,
  las.AnalysisID AS analysisId,
  las.Status AS status,
  las.ErrorInfo AS errorInfo,
  las.UpdateTime AS updateTime
FROM dbo.[ListsAnalysisStatus] las
WHERE las.ListID = @ListID;
`;
