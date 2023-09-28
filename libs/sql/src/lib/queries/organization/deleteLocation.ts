export const deleteLocation = `
BEGIN
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @list_table_name NVARCHAR(150)
	DECLARE @analysis_table_name NVARCHAR(150)

	SELECT @list_table_name = list_table_name FROM dbo.Lists WHERE id = @list_id
	SELECT @analysis_table_name = list_analysis_table_name FROM dbo.Lists WHERE id = @list_id

	PRINT @list_table_name
	PRINT @analysis_table_name

  -- Delete locations from list_table_name
	SET @TEMPLATE = 'DELETE FROM dbo.[{TABLE_NAME}] WHERE location_id = {LOCATION_ID}'
	SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @list_table_name)
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	EXEC sp_executesql @SQL

  -- Delete locations from analysis_table_name
	SET @TEMPLATE = 'DELETE FROM dbo.[{TABLE_NAME}] WHERE location_id = {LOCATION_ID}'
	SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @analysis_table_name)
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	EXEC sp_executesql @SQL
	
  -- Delete locations from Analyses-Dashboard
	SET @TEMPLATE = 'DELETE FROM dbo.[Analyses-Dashboard] WHERE list_id = {LIST_ID}
					AND (location_id = -1 OR location_id = {LOCATION_ID})'
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @list_id)
	EXEC sp_executesql @SQL

	-- Delete locations from AFIAnalysis 
  SET @TEMPLATE = 'DELETE FROM dbo.[AFIAnalysis] WHERE list_id = {LIST_ID} AND location_id = {LOCATION_ID}'
  SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}',  @list_id)
	SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
	EXEC sp_executesql @SQL
END
`;
