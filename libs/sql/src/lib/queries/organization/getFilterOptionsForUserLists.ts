export const getFilterOptionsForUserLists = `
DECLARE @listLocationTableName NVARCHAR(1000);
DECLARE @SQL NVARCHAR(MAX);

-- Retrieve the table name for the specified listId
SELECT @listLocationTableName = list_table_name
FROM Lists
WHERE id = @listId;

-- Start building the SELECT statement
SET @SQL = 'SELECT DISTINCT location_id, Country, State, [Sub State]';

-- Check for optional columns in the specified table and add them if they exist
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = @listLocationTableName AND COLUMN_NAME = 'Supplier Name')
    SET @SQL = @SQL + ', [Supplier Name]';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = @listLocationTableName AND COLUMN_NAME = 'Second Supplier Name')
    SET @SQL = @SQL + ', [Second Supplier Name]';

IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = @listLocationTableName AND COLUMN_NAME = 'Parent Company')
    SET @SQL = @SQL + ', [Parent Company]';

-- Complete the SQL query with FROM and ORDER BY
SET @SQL = @SQL + ' FROM ' + QUOTENAME(@listLocationTableName) +
                   ' ORDER BY Country, State, [Sub State]';

-- Execute the dynamically built SQL query
EXEC sp_executesql @SQL;
`;
