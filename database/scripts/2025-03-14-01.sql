-- GPV-4231: ensure indexes on location_id and location_status_id
-- Tools: SQL Multi Script
DECLARE @TableName  NVARCHAR(128);
DECLARE @SQL        NVARCHAR(MAX);

DECLARE TableCursor CURSOR FOR
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME LIKE 'analysis-%';

OPEN TableCursor;
FETCH NEXT FROM TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    -----------------------------------------------------------------------------
    -- 1) index on location_id; if none exists, create a new one
    -----------------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes i
        JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        JOIN sys.columns c        ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE i.object_id = OBJECT_ID(N'[dbo].[' + @TableName + ']')
          AND c.name = N'location_id'
    )
    BEGIN
		PRINT 'Table ' + @TableName + ' does not has location_id index';
        SET @SQL = N'CREATE NONCLUSTERED INDEX [IX_' + @TableName + '_1]
                    ON [dbo].[' + @TableName + '](location_id);';
        PRINT @SQL;
        EXEC sp_executesql @SQL;
    END;

    -----------------------------------------------------------------------------
    -- 2) index on location_status_id; if none exists, create a new one
    -----------------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes i
        JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        JOIN sys.columns c        ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE i.object_id = OBJECT_ID(N'[dbo].[' + @TableName + ']')
          AND c.name = N'location_status_id'
    )
    BEGIN
		PRINT 'Table ' + @TableName + ' does not has location_status_id index';
        SET @SQL = N'CREATE NONCLUSTERED INDEX [IX_' + @TableName + '_2]
                    ON [dbo].[' + @TableName + '](location_status_id);';
        PRINT @SQL;
        EXEC sp_executesql @SQL;
    END;

    -----------------------------------------------------------------------------
    -- next table
    -----------------------------------------------------------------------------
    FETCH NEXT FROM TableCursor INTO @TableName;
END;

CLOSE TableCursor;
DEALLOCATE TableCursor;
GO
