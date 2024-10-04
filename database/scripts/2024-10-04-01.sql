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
    -- Check if the column 'ErrorDetails' exists
    IF NOT EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @TableName 
        AND COLUMN_NAME = 'ErrorDetails'
    )
    BEGIN
        -- Build SQL to add 'ErrorDetails' column
        SET @SQL = 'ALTER TABLE ' + QUOTENAME(@TableName) + ' ADD ErrorDetails NVARCHAR(256) NULL;';
        PRINT 'Adding ErrorDetails column to ' + @TableName;
        EXEC sp_executesql @SQL;
    END
END

CLOSE TableCursor;
DEALLOCATE TableCursor;
