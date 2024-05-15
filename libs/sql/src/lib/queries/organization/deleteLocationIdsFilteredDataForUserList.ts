export const deleteLocationIdsFilteredDataForUserList = `
BEGIN
	DECLARE @listLocationTableName NVARCHAR(1000)
	DECLARE @listAnalysisTableName NVARCHAR(1000)
	DECLARE @listLocationTableCols NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @Filters NVARCHAR(MAX) = ''
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @AnalysisFilters NVARCHAR(MAX) = '1=1'

	SET NOCOUNT ON
	-- Obtain the location table name and the analysis table name for the list.
	SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM Lists WHERE id = @listID

	SET @SQL = N'
				DECLARE @KeyValuesHoldingTable TABLE (
					location_id INT
				)
				;WITH MyListTable AS (SELECT location_id as list_location_id, {LIST_ID} As list_id FROM [{LOCATION_TABLE}] ';

		IF @Country IS NOT NULL 
			SET @Filters = + @Filters + ' AND Country = @Country'

		IF @State IS NOT NULL 
			SET @Filters = + @Filters + ' AND State = @State'

		IF @SubState IS NOT NULL 
			SET @Filters = + @Filters + ' AND [Sub State] = @SubState'

		IF @SearchString IS NOT NULL
		BEGIN

			SELECT @listLocationTableCols = STUFF(
				(
				SELECT '], [' + [name] FROM sys.columns
				WHERE
					[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
					AND [name] NOT IN ('Geometry', 'location_id')
					AND user_type_id IN (SELECT user_type_id FROM sys.types WHERE name IN ('char', 'nchar', 'varchar', 'nvarchar'))
					FOR XML PATH('')
				),1,3,' ') + ']';

			DECLARE @SearchLogic NVARCHAR(MAX) = 'CONCAT({LIST_TABLE_CHAR_COLS}) LIKE ''%{SEARCH_STRING}%'' ';
			SET @SearchLogic = REPLACE(@SearchLogic, '{LIST_TABLE_CHAR_COLS}', @listLocationTableCols);
			SET @SearchLogic = REPLACE(@SearchLogic, '{SEARCH_STRING}', @SearchString);
			--PRINT @SearchLogic;
			SET @Filters = CONCAT(@Filters,' AND ', @SearchLogic);
		END


		IF ISNUMERIC( @AnalysisAreaMin ) = 1 AND ISNUMERIC( @AnalysisAreaMax ) = 1
		BEGIN
			
			IF @AnalysisAreaMin < 0 AND @AnalysisAreaMin < @AnalysisAreaMax
				BEGIN
					RAISERROR ('Invalid @AnalysisAreaMin', -1, 1); 
				END
			IF @AnalysisAreaMax < 0 AND @AnalysisAreaMax > @AnalysisAreaMin
				BEGIN
					RAISERROR ('Invalid @AnalysisAreaMax', -1, 1); 
				END
			SET @AnalysisFilters = 'total_area BETWEEN {ANALYSIS_AREA_MIN} AND {ANALYSIS_AREA_MAX}';
			SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{ANALYSIS_AREA_MIN}', @AnalysisAreaMin);
			SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{ANALYSIS_AREA_MAX}', @AnalysisAreaMax);	
		END

		IF @SelectedLocations IS NOT NULL
		BEGIN
			SET @Filters = CONCAT(@Filters,' AND location_id IN(',@SelectedLocations ,')');
		END

	-- Return data from both tables
	SET @SQL = @SQL + ' WHERE 1=1 '+@Filters + '),
		MyAnalysisTable AS(
			SELECT {LIST_ID} As analysis_list_id, location_id 
			FROM [{ANALYSIS_TABLE}] A
			WHERE ' + @AnalysisFilters + '
		)

	INSERT INTO @KeyValuesHoldingTable SELECT location_id FROM MyListTable
							INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND MyListTable.list_location_id = MyAnalysisTable.location_id
	';

		SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
		'
		SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', @listLocationTableName)

		SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE location_id IN (SELECT * FROM @KeyValuesHoldingTable)
		'
		SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', @listAnalysisTableName)
		
		SET @TEMPLATE = 'DELETE FROM [{TABLE_NAME}] WHERE list_id = {LIST_ID}
						AND (location_id = -1 OR location_id IN (SELECT * FROM @KeyValuesHoldingTable))
						'
		SET @SQL = @SQL + REPLACE(@TEMPLATE, '{TABLE_NAME}', 'Analyses-Dashboard')
		SET @SQL = REPLACE(@SQL, '{LIST_ID}',  @listID)
		SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @listAnalysisTableName);

	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
	SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);

	-- Delete locations from the AFIAnalysis
	SET @TEMPLATE = 'DELETE FROM [AFIAnalysis] 
					WHERE list_id = {LIST_ID} 
					AND (location_id = -1 OR location_id IN (SELECT * FROM @KeyValuesHoldingTable))
				'

	SET @SQL = @SQL + REPLACE(@TEMPLATE, '{LIST_ID}',  @listID)
	SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);

	EXEC sp_executesql @SQL, 
					N'@Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT',
					@Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax;
END`;
