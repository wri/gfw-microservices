-- Declare Important Variables Needed.
DECLARE @databaseName VARCHAR(500)
DECLARE @TEMPLATE NVARCHAR(500)
DECLARE @SQL NVARCHAR(500)

-- Declare a cursor to find all GFW Pro related databases.
DECLARE db_cursor CURSOR FOR
SELECT [name] AS dbName FROM sys.databases WHERE [name] LIKE 'clientstore-%' OR [name] LIKE 'gfwpro'

--Loop through results dropping each database.
OPEN db_cursor
FETCH NEXT FROM db_cursor
INTO @databaseName
WHILE  @@FETCH_STATUS = 0
BEGIN

	-- Close Existing Connections on the Database.
	SET @TEMPLATE = 'ALTER DATABASE [{DATABASENAME}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE'
	SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @databaseName)
	EXEC sp_executesql @SQL

	-- Drop the Database.
	SET @TEMPLATE = 'DROP DATABASE [{DATABASENAME}]'
	SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @databaseName)
	EXEC sp_executesql @SQL

	-- Fetch Next Row.
	FETCH NEXT FROM db_cursor INTO @databaseName
END
CLOSE db_cursor
DEALLOCATE db_cursor
