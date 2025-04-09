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
    SET @TableName = QUOTENAME(@TableName)
    -- Check if the column 'attributes' exists
    IF NOT EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID(@TableName) 
        AND name = 'attributes'
    )
    BEGIN
        -- Build SQL to add 'attributes' column
        SET @SQL = 'ALTER TABLE ' + @TableName + ' ADD attributes NVARCHAR(MAX);';
        PRINT 'Adding attributes column to ' + @TableName;
        EXEC sp_executesql @SQL;
    END

    FETCH NEXT FROM TableCursor INTO @TableName;
END

CLOSE TableCursor;
DEALLOCATE TableCursor;
