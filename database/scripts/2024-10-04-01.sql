-- Tool: SQL Multi Script
-- For: Clientstore Databases
DECLARE @TableName NVARCHAR(255);
DECLARE @SQL NVARCHAR(MAX);

DECLARE TableCursor CURSOR FOR
SELECT name 
FROM sys.tables 
WHERE name LIKE 'list-%';

OPEN TableCursor;
FETCH NEXT FROM TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Check if the column 'ErrorDetails' exists
    IF NOT EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID(@TableName) 
        AND name = 'ErrorDetails'
    )
    BEGIN
        -- Build SQL to add 'ErrorDetails' column
        SET @SQL = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' ADD ErrorDetails NVARCHAR(256) NULL;';
        PRINT 'Adding ErrorDetails column to ' + @TableName;
        EXEC sp_executesql @SQL;
    END

    FETCH NEXT FROM TableCursor INTO @TableName;
END

CLOSE TableCursor;
DEALLOCATE TableCursor;
