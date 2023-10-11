export const deleteList = `
BEGIN
  DECLARE @FOLDER_SQL NVARCHAR(MAX)
  DECLARE @LIST_SQL NVARCHAR(MAX)
  DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
  DECLARE @list_table NVARCHAR(150)
  DECLARE @analysis_table NVARCHAR(150)

  -- Selecting the list table and list analysis tables
  SELECT @list_table = list_table_name, @analysis_table = list_analysis_table_name FROM [Lists] WHERE id = @list_id

  PRINT @list_table
  PRINT @analysis_table

  -- Deleting folder items first
  SET @FOLDER_SQL = 'DELETE FROM [FolderItems] WHERE list_id = {LIST_ID}'
  SET @FOLDER_SQL = REPLACE(@FOLDER_SQL, '{LIST_ID}', @list_id)
  EXEC sp_executesql @FOLDER_SQL

  -- Setting DROPS for deleting list & analysis tables
  SET @LIST_SQL = 'DROP TABLE IF EXISTS [' + @list_table + ']'
  SET @ANALYSIS_SQL = 'DROP TABLE IF EXISTS [' + @analysis_table + ']'

  -- Deleting where list-id
  DELETE from [Lists] WHERE id = @list_id
  DELETE from [Analyses] WHERE list_id = @list_id
  DELETE from [Analyses-Dashboard] WHERE list_id = @list_id
  DELETE from [AFIAnalysis] WHERE list_id = @list_id

  -- Dropping tables
  EXEC sp_executesql @LIST_SQL
  EXEC sp_executesql @ANALYSIS_SQL
END`;
