/**
 * create row for list status of specific list
 */
export const createListAnalysisStatus = `INSERT INTO ListsAnalysisStatus (ListID, AnalysisID, Status, UpdateTime) VALUES (@ListID, '@AnalysisID', 2, GETDATE());`;
