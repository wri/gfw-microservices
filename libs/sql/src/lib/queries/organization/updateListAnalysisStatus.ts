/**
 * update status row for specific list
 * @ListID INT
 * @Status INT
 * @ErrorInfo VARCHAR(2000)
 */
export const updateListAnalysisStatus = `
UPDATE 
  ListsAnalysisStatus 
SET 
  Status = @Status, 
  ErrorInfo = @ErrorInfo,
  UpdateTime = GETDATE()
WHERE 
  ListID = @ListID;
`;
