/**
 * update status row for specific list
 * @ListID INT
 * @AnalysisID VARCHAR(30) | null
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
  ListID = @ListID 
  AND (AnalysisID = @AnalysisID OR @AnalysisID IS NULL);
`;
