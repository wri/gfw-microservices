/**
 * create row for list status of specific list
 * @ListID INT,
 * @AnalysisID NVARCHAR(150),
 * @Status INT,
 */
export const createListAnalysisStatus = `INSERT INTO ListsAnalysisStatus (ListID, AnalysisID, Status, UpdateTime) VALUES (@ListID, @AnalysisID, @Status, GETDATE());`;
