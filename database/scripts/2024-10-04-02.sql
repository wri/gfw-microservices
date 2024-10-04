-- Tool: SQL Multi Script
-- For: Clientstore Databases
DECLARE @TableName NVARCHAR(255);
DECLARE @SQL NVARCHAR(MAX);

DECLARE TableCursor CURSOR FOR
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME LIKE 'list-%';

OPEN TableCursor;
FETCH NEXT FROM TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Check if the column 'attributes' exists
    IF NOT EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @TableName 
        AND COLUMN_NAME = 'attributes'
    )
    BEGIN
        -- Build SQL to add 'attributes' column
        SET @SQL = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' ADD attributes NVARCHAR(MAX);';
        PRINT 'Adding attributes column to ' + @TableName;
        EXEC sp_executesql @SQL;
    END

    FETCH NEXT FROM TableCursor INTO @TableName;
END

CLOSE TableCursor;
DEALLOCATE TableCursor;
