export const deleteLocationIdsFilteredDataForUserList = `
BEGIN
	DECLARE @listLocationTableName NVARCHAR(1000)
	DECLARE @listAnalysisTableName NVARCHAR(1000)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @Filters NVARCHAR(MAX) = ''
	DECLARE @TEMPLATE NVARCHAR(MAX)
  DECLARE @AnalysisAreaFilter FLOAT = NULL
	DECLARE @AnalysisAreaOperator VARCHAR(10)='>'

	-- Obtain the location table name and the analysis table name for the list.
	SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM Lists WHERE id = @listID

	SET @SQL = N'
				DECLARE @KeyValuesHoldingTable TABLE (
					location_id INT
				)
				;WITH DeleteTableIds AS (SELECT location_id FROM [{LOCATION_TABLE}] ';

	IF @Country IS NOT NULL 
		SET @Filters = @Filters + ' AND Country = @Country'

	IF @State IS NOT NULL 
		SET @Filters = @Filters + ' AND State = @State'

	IF @SubState IS NOT NULL 
		SET @Filters = @Filters + ' AND [Sub State] = @SubState'
  
  -- todo: ask team what this means
	IF ISNUMERIC( @AnalysisAreaFilter ) = 1
		BEGIN
			PRINT @AnalysisAreaFilter
			IF @AnalysisAreaOperator NOT IN('>=', '<=', '<', '>')
				RAISERROR ('Invalid @AnalysisAreaOperator', -1, 1); 
			SET @Filters = + @Filters + ' AND [Analysis Area] ' + @AnalysisAreaOperator + ' @AnalysisAreaFilter '
		END

	-- Return data from both tables and store locations ids into temp table
	SET @SQL = @SQL + ' WHERE 1=1 '+@Filters + ')
							INSERT INTO @KeyValuesHoldingTable SELECT * FROM DeleteTableIds
						';

	-- Delete locations from the list_table_name
	SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
						'
	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', @listLocationTableName)

	-- Delete locations from the list_analysis_table_name
	SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
						'
	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', @listAnalysisTableName)
		
	-- Delete locations from the Analyses-Dashboard
	SET @TEMPLATE = 'DELETE FROM [Analyses-Dashboard] WHERE list_id = {LIST_ID}
						AND (location_id = -1 OR location_id IN (SELECT * FROM @KeyValuesHoldingTable))
						'
	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{LIST_ID}',  @listID)

	-- Delete locations from the AFIAnalysis
	SET @TEMPLATE = 'DELETE FROM [AFIAnalysis] WHERE list_id = {LIST_ID} 
						AND (location_id = -1 OR location_id IN (SELECT * FROM @KeyValuesHoldingTable))
						'
	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{LIST_ID}',  @listID)
	SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);

	EXEC sp_executesql @SQL, 
  	N'@Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaFilter FLOAT, @AnalysisAreaOperator VARCHAR(10), @listID INT OUTPUT',
  	@Country = @Country, @State = @State, @SubState = @SubState, @AnalysisAreaFilter = @AnalysisAreaFilter, @AnalysisAreaOperator = @AnalysisAreaOperator, @listID = @listID OUTPUT;
END`;
