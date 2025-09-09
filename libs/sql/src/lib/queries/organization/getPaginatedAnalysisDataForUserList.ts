export const getPaginatedAnalysisDataForUserList = `
BEGIN

	DECLARE @columnsList NVARCHAR(1000)
	DECLARE @listLocationTableName NVARCHAR(1000)
	DECLARE @listAnalysisTableName NVARCHAR(1000)
	DECLARE @ListColumnsWhereclause NVARCHAR(MAX) = 'AND [name] NOT IN (''Geometry'', ''location_id'')'
	DECLARE @AnalysisColumnsWhereclause NVARCHAR(MAX) = 'AND [name] NOT IN (''Geometry'')'
	DECLARE @listLocationTableCols NVARCHAR(MAX)
	DECLARE @listAnalysisTableCols NVARCHAR(MAX)
	DECLARE @template_id INT
	DECLARE @PRESQL NVARCHAR(MAX)
	DECLARE @presql_list_params NVARCHAR(MAX) = '@list_location_table_cols_query VARCHAR(MAX) OUTPUT';
	DECLARE @presql_analysis_params NVARCHAR(MAX) = '@analysis_location_table_cols_query VARCHAR(MAX) OUTPUT';
	DECLARE @list_location_table_cols_output NVARCHAR(MAX);
	DECLARE @analysis_location_table_cols_output NVARCHAR(MAX);
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @Filters NVARCHAR(MAX) = ''
	DECLARE @AnalysisFilters NVARCHAR(MAX) = '1=1'
	DECLARE @listVersion INT
	DECLARE @where_clauses NVARCHAR(max) = '';
	DECLARE @cleanedOrderByColumn NVARCHAR(MAX) = REPLACE(REPLACE(@OrderByColumn, '[', ''), ']', '')
	DECLARE @originalOrderByColumn NVARCHAR(MAX) = @OrderByColumn

	SET NOCOUNT ON
	-- Obtain the location table name and the analysis table name for the list.
	SELECT
		@listLocationTableName = list_table_name
		, @listAnalysisTableName = list_analysis_table_name
		, @template_id = template_id
		, @listVersion = version
	FROM dbo.Lists WITH (NOLOCK) WHERE id = @listID


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


	END

	SET @PRESQL = N'SELECT @list_location_table_cols_query = STUFF(
		  (
			SELECT ''], lt.['' + [name] FROM sys.columns WITH (NOLOCK)
			WHERE
			  [object_id] = (SELECT [object_id] FROM sys.objects WITH (NOLOCK) WHERE [name] = ''{LIST_LOCATION_TABLE_NAME}'')
			  {WHERE_CLAUSE}
			  FOR XML PATH('''')
		  ),1,3,'''') + '']''';
	SET @PRESQL = REPLACE(@PRESQL, '{LIST_LOCATION_TABLE_NAME}', @listLocationTableName)
	SET @PRESQL = REPLACE(@PRESQL, '{WHERE_CLAUSE}', @ListColumnsWhereclause);

	EXEC sp_executesql @PRESQL, @presql_list_params, @list_location_table_cols_query = @list_location_table_cols_output OUTPUT;

	IF @listVersion >= 2
		BEGIN
				IF @jsonAttributeColumns IS NOT NULL AND @jsonAttributeColumns <> ''
				BEGIN
					SET @list_location_table_cols_output = @list_location_table_cols_output + ', ' + @jsonAttributeColumns;
				END
		END

	SET @PRESQL = N'SELECT @analysis_location_table_cols_query = STUFF(
		  (
			SELECT ''], A.['' + [name] FROM sys.columns WITH (NOLOCK)
			WHERE
			  [object_id] = (SELECT [object_id] FROM sys.objects WITH (NOLOCK) WHERE [name] = ''{LIST_ANALYSIS_TABLE_NAME}'')
			  {WHERE_CLAUSE}
			  FOR XML PATH('''')
		  ),1,3,'''') + '']''';
	SET @PRESQL = REPLACE(@PRESQL, '{LIST_ANALYSIS_TABLE_NAME}', @listAnalysisTableName)
	SET @PRESQL = REPLACE(@PRESQL, '{WHERE_CLAUSE}', @AnalysisColumnsWhereclause);

	EXEC sp_executesql @PRESQL, @presql_analysis_params, @analysis_location_table_cols_query = @analysis_location_table_cols_output OUTPUT;



			SELECT @listAnalysisTableCols = STUFF(
	  (
		SELECT '], A.[' + [name] FROM sys.columns WITH (NOLOCK)
		WHERE
		  [object_id] = (SELECT [object_id] FROM sys.objects WITH (NOLOCK) WHERE [name] = @listAnalysisTableName)
		  AND [name] NOT IN ('id')
		  FOR XML PATH('')
	  ),1,3,'') + '], A.location_status_id, A.location_error as analysisError';


	-- ADD Filters
	IF @Country IS NOT NULL
	  SET @Filters = + @Filters + ' AND lt.Country = @Country'

	IF @State IS NOT NULL
	  SET @Filters = + @Filters + ' AND lt.State = @State'

	IF @SubState IS NOT NULL
	  SET @Filters = + @Filters + ' AND lt.[Sub State] = @SubState'
	IF @selectedSupplier IS NOT NULL
        SET @Filters = + @Filters + ' AND lt.[Supplier Name] = @selectedSupplier'
    IF @selectedSecondSupplier IS NOT NULL
        SET @Filters = + @Filters + ' AND lt.[Second Supplier Name] = @selectedSecondSupplier'
    IF @selectedParentCompany IS NOT NULL
        SET @Filters = + @Filters + ' AND lt.[Parent Company] = @selectedParentCompany'
    IF @showRSPOCertified = 1
        SET @Filters = + @Filters + ' AND lt.[RSPO Model] = 1'
	IF @LocationLogic IS NOT NULL AND @LocationIds IS NOT NULL
	BEGIN
		IF CHARINDEX('IN', @LocationLogic) > 0
			BEGIN
				SET @LocationStatement = 'AND lt.location_id ' + @LocationLogic + ' (' + @LocationIds + ')'
				SET @Filters = CONCAT(@Filters, ' ', @LocationStatement);
			END
		IF CHARINDEX('BETWEEN', @LocationLogic) > 0
			BEGIN
				DECLARE @BetweenLogic NVARCHAR(1000) = ' AND lt.location_id ' + @LocationLogic;
				WITH LocationIdsCTE AS (
					SELECT value AS locations FROM STRING_SPLIT(@LocationIds, ',')
				)

				SELECT @LocationStatement = STRING_AGG(locations, @BetweenLogic)
				FROM LocationIdsCTE;

				SET @Filters = CONCAT(@Filters,' AND lt.location_id ', @LocationLogic, ' ', @LocationStatement);
			END
	END

	IF @SearchString IS NOT NULL
	BEGIN

		SELECT @listLocationTableCols = STUFF(
		  (
			SELECT '], lt.[' + [name] FROM sys.columns WITH (NOLOCK)
			WHERE
			  [object_id] = (SELECT [object_id] FROM sys.objects WITH (NOLOCK) WHERE [name] = @listLocationTableName)
			  AND [name] NOT IN ('Geometry', 'location_id')
				AND user_type_id IN (SELECT user_type_id FROM sys.types WITH (NOLOCK) WHERE name IN ('char', 'nchar', 'varchar', 'nvarchar'))
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
		--PRINT 'Analysis Filter';
		--PRINT 'TEST-' + CONVERT(VARCHAR(50), @AnalysisAreaMin) + ' TO ' + CONVERT(VARCHAR(50), @AnalysisAreaMax);
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
		--PRINT @AnalysisFilters;
	END

	-- END Filters
	-- CASE-SENSITIVE JSON FILTERS
	IF @selectedOverallThreats IS NOT NULL
    BEGIN
        set @where_clauses = '(SELECT TOP 1 CAST(value AS INT) AS last_property
                                FROM OPENJSON(commodity_threat_overall_level COLLATE Latin1_General_CS_AS)
                                WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_threat_overall_level COLLATE Latin1_General_CS_AS) ORDER BY [key] DESC)
                                AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallThreats COLLATE Latin1_General_CS_AS))) IS NOT NULL'
    END
    IF @selectedOverallValues IS NOT NULL
    BEGIN
        IF @where_clauses <> ''
            SET @where_clauses = @where_clauses + ' AND ';

                set @where_clauses = @where_clauses + '(SELECT TOP 1 CAST(value AS INT) AS last_property
                                FROM OPENJSON(commodity_value_overall_level COLLATE Latin1_General_CS_AS)
                                WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_value_overall_level COLLATE Latin1_General_CS_AS) ORDER BY [key] DESC)
                                AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallValues COLLATE Latin1_General_CS_AS))) IS NOT NULL'

    END
    IF @selectedMillPriority IS NOT NULL
    BEGIN
        IF @where_clauses <> ''
            SET @where_clauses = @where_clauses + ' AND ';
        set @where_clauses = @where_clauses + '(SELECT TOP 1 CAST(value AS INT) AS last_property
                            FROM OPENJSON(commodity_mill_priority_level COLLATE Latin1_General_CS_AS)
                            WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_mill_priority_level COLLATE Latin1_General_CS_AS) ORDER BY [key] DESC)
                            AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedMillPriority COLLATE Latin1_General_CS_AS))) IS NOT NULL'
	END
	IF @where_clauses <>''
	 SET @AnalysisFilters = @AnalysisFilters + ' AND ' + @where_clauses


-- CASE-SENSITIVE JSON COLUMN PARSING WITH UNIQUE ALIASES
DECLARE @jsonColumns TABLE (
    ColumnName NVARCHAR(255),
    AliasName NVARCHAR(255)
);

-- Add all columns with unique aliases to handle case sensitivity
INSERT INTO @jsonColumns (ColumnName, AliasName)
VALUES
    ('commodity_threat_deforestation_level', 'threat_deforestation_cs'),
    ('commodity_threat_peat_level', 'threat_peat_cs'),
    ('commodity_threat_protected_areas_level', 'threat_protected_areas_cs'),
    ('commodity_threat_fires_level', 'threat_fires_cs'),
    ('commodity_value_forest_extent_level', 'value_forest_extent_cs'),
    ('commodity_value_peat_level', 'value_peat_cs'),
    ('commodity_value_protected_areas_level', 'value_protected_areas_cs'),
    ('commodity_value_overall_level', 'value_overall_cs'),
    ('commodity_threat_overall_level', 'threat_overall_cs'),
    ('commodity_mill_priority_level', 'mill_priority_cs');

DECLARE @parsedColumns NVARCHAR(MAX) = '';

DECLARE @columnName NVARCHAR(255);
DECLARE @aliasName NVARCHAR(255);
DECLARE column_cursor CURSOR FOR SELECT ColumnName, AliasName FROM @jsonColumns;

OPEN column_cursor;
FETCH NEXT FROM column_cursor INTO @columnName, @aliasName;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @parsedColumn NVARCHAR(MAX);

    -- Case-sensitive JSON parsing with unique alias
    SET @parsedColumn = '
        (SELECT TOP 1 CAST(value AS INT)
         FROM OPENJSON(' + @columnName + ' COLLATE Latin1_General_CS_AS)
         ORDER BY [key] COLLATE Latin1_General_CS_AS DESC
        ) AS ' + @aliasName;

	-- append the parsed column with suffix '_parsed' to be displayed in the list-details table
	SET @parsedColumn = @parsedColumn + ',
		(SELECT TOP 1 CAST(value AS INT)
		FROM OPENJSON(' + @columnName + ' COLLATE Latin1_General_CS_AS)
		ORDER BY [key] COLLATE Latin1_General_CS_AS DESC
		) AS ' + @columnName + '_parsed';

    -- Append to @parsedColumns
    IF @parsedColumns = ''
        SET @parsedColumns = @parsedColumn;
    ELSE
        SET @parsedColumns = @parsedColumns + ', ' + @parsedColumn;

    FETCH NEXT FROM column_cursor INTO @columnName, @aliasName;
END

CLOSE column_cursor;
DEALLOCATE column_cursor;

	-- Build the dynamic SQL with optimized CTE and indexing hints
	SET @SQL = N'
		WITH MyAnalysisTable AS (
			SELECT
				{LIST_ID} AS analysis_list_id,
				{TEMPLATE_ID} AS template_id,
				{ANALYSIS_COLUMNS},
				' + @parsedColumns + '
			FROM [{ANALYSIS_TABLE}] A WITH (NOLOCK)
			WHERE ' + @AnalysisFilters + '
		)
		SELECT
			{LIST_ID} AS list_id,
			{LOCATION_COLUMNS},
			lt.location_id AS list_location_id'

	IF @Geometry = 1
	BEGIN
		SET @SQL = @SQL + ', lt.Geometry.ToString() AS [WKTGeometry]'
	END

	SET @SQL = @SQL + ',
			MyAnalysisTable.*
		FROM [{LOCATION_TABLE}] lt WITH (NOLOCK)
		INNER JOIN MyAnalysisTable
			ON {LIST_ID} = MyAnalysisTable.analysis_list_id
			AND lt.location_id = MyAnalysisTable.location_id
		WHERE 1=1 ' + @Filters + '
		ORDER BY ' +
		CASE
			WHEN @OrderByColumn = 'Location Name' OR @OrderByColumn = '[Location Name]'
				THEN 'lt.[Location Name]'
			WHEN @OrderByColumn = 'Investment Name' OR @OrderByColumn = '[Investment Name]'
				THEN 'lt.[Investment Name]'
			WHEN EXISTS (
				SELECT 1
				FROM ListAttributes WITH (NOLOCK)
				WHERE list_id = @listID
				AND attribute_name = @cleanedOrderByColumn COLLATE Latin1_General_CS_AS
			)
				THEN CASE
					WHEN (
						SELECT attribute_type
						FROM ListAttributes WITH (NOLOCK)
						WHERE list_id = @listID
						AND attribute_name = @cleanedOrderByColumn COLLATE Latin1_General_CS_AS
					) = 1
					THEN 'CAST(JSON_VALUE(lt.attributes COLLATE Latin1_General_CS_AS, ''$."' + REPLACE(REPLACE(@cleanedOrderByColumn, '''', ''''''), '"', '""') + '"'') AS DECIMAL(18,6))'
					ELSE 'CAST(JSON_VALUE(lt.attributes COLLATE Latin1_General_CS_AS, ''$."' + REPLACE(REPLACE(@cleanedOrderByColumn, '''', ''''''), '"', '""') + '"'') AS NVARCHAR(MAX))'
				END
						WHEN @listVersion >= 2 AND @cleanedOrderByColumn NOT LIKE '%[[]%' AND @cleanedOrderByColumn NOT LIKE '%]%'
				AND (@jsonAttributeColumns IS NULL OR CHARINDEX(@cleanedOrderByColumn, @jsonAttributeColumns) > 0)
				THEN 'CAST(JSON_VALUE(lt.attributes COLLATE Latin1_General_CS_AS, ''$."' + REPLACE(REPLACE(REPLACE(@cleanedOrderByColumn, '''', ''''''), '"', '""'), '\\', '\\\\') + '"'') AS NVARCHAR(MAX))'
						WHEN CHARINDEX(@OrderByColumn, @list_location_table_cols_output) > 0
				AND @listVersion < 2
				THEN 'lt.' + QUOTENAME(REPLACE(REPLACE(@OrderByColumn, '[', ''), ']', ''))
			WHEN CHARINDEX(@OrderByColumn, @list_location_table_cols_output) > 0
				AND @listVersion >= 2
				AND (@jsonAttributeColumns IS NULL OR CHARINDEX(@cleanedOrderByColumn, @jsonAttributeColumns) = 0)
				THEN 'lt.' + QUOTENAME(REPLACE(REPLACE(@OrderByColumn, '[', ''), ']', ''))
			WHEN CHARINDEX(@OrderByColumn, @analysis_location_table_cols_output) > 0
				THEN 'MyAnalysisTable.' + QUOTENAME(@cleanedOrderByColumn)
			ELSE 'lt.location_id'
		END + ' ' + @Order

	IF @RowsOfPage > 0 AND @PageNumber > 0
		SET @SQL = @SQL + ' OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY';

	-- Replace tokens with actual values
	SET @SQL = REPLACE(@SQL, '{TEMPLATE_ID}', @template_id);
	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
	SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @list_location_table_cols_output);
	SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_COLUMNS}', @analysis_location_table_cols_output);
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @listAnalysisTableName);

	EXEC sp_executesql @SQL,
		N'@PageNumber INT, @RowsOfPage INT, @OrderByColumn NVARCHAR(MAX), @Order NVARCHAR(5), @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT, @selectedSupplier NVARCHAR(150), @selectedSecondSupplier NVARCHAR(150), @selectedParentCompany NVARCHAR(150), @showRSPOCertified BIT, @selectedOverallThreats NVARCHAR(150), @selectedOverallValues NVARCHAR(150), @selectedMillPriority NVARCHAR(150), @jsonAttributeColumns NVARCHAR(MAX)',
		@PageNumber=@PageNumber, @RowsOfPage=@RowsOfPage, @OrderByColumn=@OrderByColumn, @Order=@Order, @Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax, @selectedSupplier=@selectedSupplier, @selectedSecondSupplier=@selectedSecondSupplier, @selectedParentCompany=@selectedParentCompany, @showRSPOCertified=@showRSPOCertified, @selectedOverallThreats=@selectedOverallThreats, @selectedOverallValues=@selectedOverallValues, @selectedMillPriority=@selectedMillPriority, @jsonAttributeColumns=@jsonAttributeColumns;

END
`;

export interface AnalysisDataType {
  list_id: number;
  'Location Name': string;
  Latitude: number;
  Longitude: number;
  'Analysis Radius': number;
  'Analysis Area': number;
  Commodity: string;
  'Location Classification': string;
  'Company ID': string;
  Volume: number;
  'Owner Name': string;
  'Owner ID': string;
  'Company Name': string;
  'Supplier Name': string;
  'Facility Name': string;
  'Refinery Name': string;
  Certification: string;
  'Start Date': string;
  'End Date': string;
  'Time Horizon': string;
  'Accuracy Rating of Location Entered': string;
  Country: string;
  State: string;
  attributes?: string;
  'Sub State': string;
  'Wind Barrier': string;
  'Riparian Buffers': string;
  'Buffers Zones': string;
  gadmid: string;
  flag_general: string;
  flag_gran_chaco: string;
  flag_glad: string;
  flag_forma: string;
  flag_viirs: string;
  flag_terrai: string;
  list_location_id: number;
  analysis_list_id: number;
  template_id: number;
  id: number;
  location_id: number;
  location_status_id: number;
  tree_cover_loss_total_yearly: string;
  tree_cover_loss_primary_forest_yearly: string;
  tree_cover_loss_peat_yearly: string;
  tree_cover_loss_intact_forest_yearly: string;
  tree_cover_loss_protected_areas_yearly: string;
  tree_cover_loss_sea_landcover_yearly: string;
  tree_cover_loss_idn_landcover_yearly: string;
  tree_cover_loss_idn_primary_forest_yearly: string;
  tree_cover_loss_soy_yearly: string;
  tree_cover_loss_idn_legal_yearly: string;
  tree_cover_loss_idn_forest_moratorium_yearly: string;
  tree_cover_loss_prodes_yearly: string;
  tree_cover_loss_prodes_wdpa_yearly: string;
  tree_cover_loss_prodes_primary_forest_yearly: string;
  tree_cover_loss_brazil_biomes_yearly: string;
  tree_cover_extent_total: number;
  tree_cover_extent_primary_forest: number;
  tree_cover_extent_protected_areas: number;
  tree_cover_extent_peat: number;
  tree_cover_extent_intact_forest: number;
  natural_habitat_primary: number;
  natural_habitat_intact_forest: number;
  natural_habitat_global_land_cover: string;
  total_area: number;
  protected_areas_area: number;
  critical_habitat_alliance_zero: number;
  indigenous_people_land_rights: number;
  peat_area: number;
  fires_counts_monthly: string;
  soy_total_area: string;
  soy_pre2001_nonforest_area: number;
  brazil_biomes: string;
  idn_legal_area: string;
  sea_landcover_area: string;
  idn_landcover_area: string;
  idn_forest_moratorium_area: number;
  south_america_presence: string;
  legal_amazon_presence: string;
  brazil_biomes_presence: string;
  cerrado_biome_presence: string;
  southeast_asia_presence: string;
  indonesia_presence: string;
  commodity_threat_deforestation_level: string;
  commodity_threat_peat_level: string;
  commodity_threat_protected_areas_level: string;
  commodity_threat_fires_level: string;
  commodity_threat_overall_level: string;
  commodity_threat_overall_score: string;
  commodity_value_forest_extent_level: string;
  commodity_value_peat_level: string;
  commodity_value_protected_areas_level: string;
  commodity_value_overall_level: string;
  commodity_value_overall_score: string;
  commodity_value_forest_extent: string;
  commodity_value_peat: string;
  commodity_value_protected_areas: string;
  commodity_mill_priority_level: string;
  commodity_mill_priority_score: string;
  commodity_threat_deforestation: string;
  commodity_threat_peat: string;
  commodity_threat_protected_areas: string;
  commodity_threat_fires: string;
  dissolved_data_location_info: string;
  tree_cover_loss_arg_otbn_yearly: string;
  classified_region_area: string;
}
