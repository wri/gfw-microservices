/*========================================================================================
  -- GPV-4189
DB: Add location_error column to Analyses-Dashboard table
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
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = ''Analyses-Dashboard'' 
        AND COLUMN_NAME = ''location_error''
    )
    BEGIN
        ALTER TABLE [dbo].[Analyses-Dashboard]
        ADD [location_error] [nvarchar](max) NULL;
    END;
    ';

    EXEC sp_executesql @SQL;

    FETCH NEXT FROM orgdb_cursor INTO @OrgDbName;
END;

CLOSE orgdb_cursor;
DEALLOCATE orgdb_cursor;
