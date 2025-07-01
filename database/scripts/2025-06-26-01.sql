/*========================================================================================
  -- GPV-4623
DB: Add index to ListsProcessing table across org DBs
========================================================================================*/

DECLARE @OrgDbName NVARCHAR(128);
DECLARE @SQL NVARCHAR(MAX);

DECLARE orgdb_cursor CURSOR FOR
SELECT [organization_db] FROM [gfwpro].[dbo].[Organizations];

OPEN orgdb_cursor;
FETCH NEXT FROM orgdb_cursor INTO @OrgDbName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = '
    USE ' + QUOTENAME(@OrgDbName) + ';
    IF EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = ''ListsProcessing''
    )
    AND NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = ''IX_ListId_AnalysisType_StartTime''
          AND object_id = OBJECT_ID(''dbo.ListsProcessing'')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX IX_ListId_AnalysisType_StartTime
        ON dbo.ListsProcessing (list_id, analysis_type, analysis_start_time);
    END;
    ';

    EXEC sp_executesql @SQL;

    FETCH NEXT FROM orgdb_cursor INTO @OrgDbName;
END;

CLOSE orgdb_cursor;
DEALLOCATE orgdb_cursor;
