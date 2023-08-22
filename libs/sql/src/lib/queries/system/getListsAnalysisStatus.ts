export const getListsAnalysisStatus =
  // `SELECT ListID, AnalysisID, Status, ErrorInfo FROM [dbo].[ListsAnalysisStatus]`;
  `DECLARE @DBName NVARCHAR(100);
DECLARE @SQL NVARCHAR(MAX);

SELECT @DBName = org.organization_db
FROM Organizations org JOIN
  Statuses st ON st.id = org.organization_status_id 
WHERE st.status_name = 'active' AND org.id = @organizationId;

SET @SQL = N'
  USE ' + QUOTENAME(@DBName) + ';
  SELECT ListID, AnalysisID, Status, ErrorInfo
  FROM dbo.ListsAnalysisStatus;
';

EXEC sp_executesql @SQL;
`;

export interface ListsAnalysisStatus {
  ListID: number;
  AnalysisID: number;
  Status: string;
  ErrorInfo: string | null; // Assuming ErrorInfo can be null
}
