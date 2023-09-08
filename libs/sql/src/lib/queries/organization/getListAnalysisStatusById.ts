export const getListAnalysisStatusById = `
SELECT
  las.ListID,
  las.AnalysisID,
  las.Status,
  las.ErrorInfo,
  las.UpdateTime
FROM dbo.[ListsAnalysisStatus] las
WHERE las.ListID = @ListID;
`;
