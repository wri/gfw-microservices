export const dropListAnalysisStatusByListIdAndAnalysisId = `DELETE FROM dbo.[ListsAnalysisStatus] WHERE ListID = @ListID AND AnalysisID = @AnalysisID;`;
