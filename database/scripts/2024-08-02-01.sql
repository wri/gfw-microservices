-- Checks if an organization has trailing spaces in the name
-- Prefered Tool: Microsoft SQL Server

-- Define the table and column you want to check and update
-- DECLARE @TableName NVARCHAR(128) = 'Organizations'
DECLARE @TableName NVARCHAR(128) = 'PendingAccounts';
DECLARE @ColumnName NVARCHAR(128) = 'organization_name' 

-- Create a dynamic SQL query to check for trailing spaces
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'SELECT * FROM ' + QUOTENAME(@TableName) + 
           N' WHERE ' + QUOTENAME(@ColumnName) + N' LIKE ''% ''';

-- Execute the dynamic SQL to check for trailing spaces
EXEC sp_executesql @SQL;

-- Create a dynamic SQL query to remove trailing spaces
SET @SQL = N'UPDATE ' + QUOTENAME(@TableName) + 
           N' SET ' + QUOTENAME(@ColumnName) + N' = RTRIM(' + QUOTENAME(@ColumnName) + N')' + 
           N' WHERE ' + QUOTENAME(@ColumnName) + N' LIKE ''% ''';

-- Execute the dynamic SQL to remove trailing spaces
EXEC sp_executesql @SQL;

-- Verify that trailing spaces are removed
SET @SQL = N'SELECT * FROM ' + QUOTENAME(@TableName) + 
           N' WHERE ' + QUOTENAME(@ColumnName) + N' LIKE ''% ''';

-- Execute the dynamic SQL to verify
EXEC sp_executesql @SQL;
