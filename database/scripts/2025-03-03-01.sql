-- feat [GPV-4190] for every clientstore-DATABASE
-- Tool: SQL Multi Script
DECLARE @TableName nvarchar(128);
DECLARE @SQL nvarchar(max);

-- Cursor to loop through all tables with the pattern 'analysis-XXXX' and the table 'Analyses'
DECLARE TableCursor CURSOR FOR
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'analysis-%';

OPEN TableCursor;
FETCH NEXT FROM TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Check if 'location_error' column exists
    IF NOT EXISTS (
        SELECT * 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @TableName 
          AND COLUMN_NAME = 'location_error'
    )
    BEGIN
        -- Add 'country_area' column
        SET @SQL = 'ALTER TABLE [' + @TableName + '] ADD [location_error] NVARCHAR(MAX);';
        EXEC sp_executesql @SQL;
    END

    -- Fetch the next table
    FETCH NEXT FROM TableCursor INTO @TableName;
END

-- Close and deallocate the cursor
CLOSE TableCursor;
DEALLOCATE TableCursor;
