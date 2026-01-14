export const getGFWListsFilteredToCopy = `
	DECLARE @columnsList NVARCHAR(1000)
	DECLARE @listLocationTableName NVARCHAR(1000)
	DECLARE @listAnalysisTableName NVARCHAR(1000)
	DECLARE @ListColumnsWhereclause NVARCHAR(MAX) = 'AND [name] NOT IN (''Geometry'', ''location_id'')'
	DECLARE @AnalysisColumnsWhereclause NVARCHAR(MAX) = 'AND [name] NOT IN (''Geometry'')'
	DECLARE @listLocationTableCols NVARCHAR(MAX)
	DECLARE @listAnalysisTableCols NVARCHAR(MAX)
	DECLARE @PRESQL NVARCHAR(MAX)
	DECLARE @presql_list_params NVARCHAR(MAX) = '@list_location_table_cols_query VARCHAR(MAX) OUTPUT';
	DECLARE @presql_analysis_params NVARCHAR(MAX) = '@analysis_location_table_cols_query VARCHAR(MAX) OUTPUT';
	DECLARE @list_location_table_cols_output NVARCHAR(MAX);
	DECLARE @analysis_location_table_cols_output NVARCHAR(MAX);
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @Filters NVARCHAR(MAX) = ''
	DECLARE @AnalysisFilters NVARCHAR(MAX) = '1=1'


	SET NOCOUNT ON
	-- Obtain the location table name and the analysis table name for the list.
	SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM dbo.GFWLists WHERE id = @listID


	-- Default column location name is not found
	IF @OrderByColumn = 'Location Name'
	BEGIN
		IF COL_LENGTH(@listLocationTableName, 'Location Name') IS NULL
		BEGIN
			SET @OrderByColumn = '[Investment Name]'
		END
		ELSE
		BEGIN
			SET @OrderByColumn = '[Location Name]'
		END
	END
	IF @OrderByColumn = 'Investment Name'
	BEGIN
		IF COL_LENGTH(@listLocationTableName, 'Investment Name') IS NULL
		BEGIN
			SET @OrderByColumn = '[Location Name]'
		END
		ELSE
		BEGIN
			SET @OrderByColumn = '[Investment Name]'
		END
	END

	IF @OrderByColumn NOT IN ('Investment Name', 'Location Name', '[Investment Name]','[Location Name]')
	BEGIN
		SET @OrderByColumn = '['+@OrderByColumn+']'
	END
	-- Obtain the needed columns from the List Location Table. (All but Geometry)

	IF @ColumnsToReturn IS NOT NULL
	BEGIN
		WITH ColumnsCTE AS (
			SELECT TRIM(value) AS cols FROM STRING_SPLIT(@ColumnsToReturn, ',')
		)

		SELECT @columnsList = CONCAT('''', STRING_AGG(cols, ''', '''), '''')
		FROM ColumnsCTE;

		SET @ListColumnsWhereclause = CONCAT(@ListColumnsWhereclause, ' ', 'AND [name] IN (''Location Name'', ''Investment Name'', ''Country'', ''State'', ''Sub State'', ', @columnsList, ')')
		SET @AnalysisColumnsWhereclause = CONCAT(@AnalysisColumnsWhereclause, ' ', 'AND [name] IN (''location_id'', ''total_area'', ', @columnsList, ')')

	END

	SET @PRESQL = N'SELECT @list_location_table_cols_query = STUFF(
		  (
			SELECT ''], L.['' + [name] FROM sys.columns
			WHERE
			  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''{LIST_LOCATION_TABLE_NAME}'')
			  {WHERE_CLAUSE}
			  FOR XML PATH('''')
		  ),1,3,'''') + '']''';
	SET @PRESQL = REPLACE(@PRESQL, '{LIST_LOCATION_TABLE_NAME}', @listLocationTableName)
	SET @PRESQL = REPLACE(@PRESQL, '{WHERE_CLAUSE}', @ListColumnsWhereclause);

	EXEC sp_executesql @PRESQL, @presql_list_params, @list_location_table_cols_query = @list_location_table_cols_output OUTPUT;


	SET @SQL = N'; WITH MyListTable AS (SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, location_id as list_location_id'
	IF @Geometry = 1
	BEGIN
	  SET @SQL = @SQL + ', Geometry.ToString() As [WKTGeometry]'
	END

	SET @SQL = @SQL + ' FROM [{LOCATION_TABLE}] L), ';

	SET @PRESQL = N'SELECT @analysis_location_table_cols_query = STUFF(
		  (
			SELECT ''], A.['' + [name] FROM sys.columns
			WHERE
			  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''{LIST_ANALYSIS_TABLE_NAME}'')
			  {WHERE_CLAUSE}
			  FOR XML PATH('''')
		  ),1,3,'''') + '']''';
	SET @PRESQL = REPLACE(@PRESQL, '{LIST_ANALYSIS_TABLE_NAME}', @listAnalysisTableName)
	SET @PRESQL = REPLACE(@PRESQL, '{WHERE_CLAUSE}', @AnalysisColumnsWhereclause);

	EXEC sp_executesql @PRESQL, @presql_analysis_params, @analysis_location_table_cols_query = @analysis_location_table_cols_output OUTPUT;

	-- Obtain the needed columns from the List Analysis Table. (All but List ID)
	SELECT @listAnalysisTableCols = STUFF(
	  (
		SELECT '], A.[' + [name] FROM sys.columns
		WHERE
		  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listAnalysisTableName)
		  AND [name] NOT IN ('id')
		  FOR XML PATH('')
	  ),1,3,'') + ']';


	-- ADD Filters
    IF @Country IS NOT NULL
      SET @Filters = + @Filters + ' AND Country = @Country'

    IF @State IS NOT NULL
      SET @Filters = + @Filters + ' AND State = @State'

    IF @SubState IS NOT NULL
      SET @Filters = + @Filters + ' AND [Sub State] = @SubState'

	IF @LocationLogic IS NOT NULL AND @LocationIds IS NOT NULL
    BEGIN
        IF CHARINDEX('IN', @LocationLogic) > 0
            BEGIN
                SET @LocationStatement = 'AND list_location_id ' + @LocationLogic + ' (' + @LocationIds + ')'
                SET @Filters = CONCAT(@Filters, ' ', @LocationStatement);
            END
        IF CHARINDEX('BETWEEN', @LocationLogic) > 0
            BEGIN
                DECLARE @BetweenLogic NVARCHAR(1000) = ' AND list_location_id ' + @LocationLogic;
                WITH LocationIdsCTE AS (
                    SELECT value AS locations FROM STRING_SPLIT(@LocationIds, ',')
                )

                SELECT @LocationStatement = STRING_AGG(locations, @BetweenLogic)
                FROM LocationIdsCTE;

                SET @Filters = CONCAT(@Filters,' AND list_location_id ', @LocationLogic, ' ', @LocationStatement);
            END
    END

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
        SET @Filters = CONCAT(@Filters,' AND list_location_id IN(',@SelectedLocations ,')');
    END

	-- END Filters

	-- Return data from both tables
	SET @SQL = @SQL + ' MyAnalysisTable AS(
                            SELECT {LIST_ID} As analysis_list_id, {ANALYSIS_COLUMNS}
                            FROM [{ANALYSIS_TABLE}] A
                            WHERE ' + @AnalysisFilters + '
                        )
                        SELECT * FROM MyListTable
                        LEFT JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND MyListTable.list_location_id = MyAnalysisTable.location_id
                        WHERE 1=1 '+@Filters+'
                        ORDER BY '+ @OrderByColumn + ' '+ @Order

	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
	SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @list_location_table_cols_output);
	SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_COLUMNS}', @analysis_location_table_cols_output);
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @listAnalysisTableName);


    EXEC sp_executesql @SQL,
			  N'@OrderByColumn NVARCHAR(MAX), @Order NVARCHAR(5), @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT',
			  @OrderByColumn=@OrderByColumn, @Order=@Order, @Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax;
`;
