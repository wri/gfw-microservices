export const getPaginatedAnalysisDataForUserList = `
BEGIN
	DECLARE @listLocationTableName NVARCHAR(1000)
	DECLARE @listAnalysisTableName NVARCHAR(1000)
	DECLARE @template_id INT
	DECLARE @listVersion INT
	DECLARE @list_location_table_cols_output NVARCHAR(MAX)
	DECLARE @analysis_location_table_cols_output NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @Filters NVARCHAR(MAX) = ''
	DECLARE @AnalysisFilters NVARCHAR(MAX) = '1=1'
	DECLARE @where_clauses NVARCHAR(MAX) = ''
	DECLARE @cleanedOrderByColumn NVARCHAR(MAX) = REPLACE(REPLACE(@OrderByColumn, '[', ''), ']', '')

	SET NOCOUNT ON

	-- Get list metadata
	SELECT
		@listLocationTableName = list_table_name,
		@listAnalysisTableName = list_analysis_table_name,
		@template_id = template_id,
		@listVersion = version
	FROM dbo.Lists WHERE id = @listID

	-- Handle default column ordering
	IF @OrderByColumn = 'Location Name' AND COL_LENGTH(@listLocationTableName, 'Location Name') IS NULL
		SET @OrderByColumn = '[Investment Name]'
	ELSE IF @OrderByColumn = 'Location Name'
		SET @OrderByColumn = '[Location Name]'
	ELSE IF @OrderByColumn = 'Investment Name' AND COL_LENGTH(@listLocationTableName, 'Investment Name') IS NULL
		SET @OrderByColumn = '[Location Name]'
	ELSE IF @OrderByColumn = 'Investment Name'
		SET @OrderByColumn = '[Investment Name]'
	ELSE IF @OrderByColumn NOT IN ('Investment Name', 'Location Name', '[Investment Name]','[Location Name]')
		SET @OrderByColumn = '[' + @OrderByColumn + ']'

	-- Build column list for location table
	DECLARE @ListColumnsWhereclause NVARCHAR(MAX) = 'AND [name] NOT IN (''Geometry'', ''location_id'')'
	IF @ColumnsToReturn IS NOT NULL
	BEGIN
		WITH ColumnsCTE AS (SELECT TRIM(value) AS cols FROM STRING_SPLIT(@ColumnsToReturn, ','))
		SELECT @ListColumnsWhereclause = @ListColumnsWhereclause + ' AND [name] IN (''Location Name'', ''Investment Name'', ''Country'', ''State'', ''Sub State'', ' +
			CONCAT('''', STRING_AGG(cols, ''', '''), '''') + ')'
		FROM ColumnsCTE
	END

	-- Get location table columns
	DECLARE @locationColumnsSQL NVARCHAR(MAX)
	SET @locationColumnsSQL = N'SELECT @list_location_table_cols_query = STUFF((
		SELECT '', ['' + [name] + '']'' FROM sys.columns
		WHERE [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @tableName)
		' + @ListColumnsWhereclause + '
		FOR XML PATH('''')
	),1,2,'''')'

	EXEC sp_executesql @locationColumnsSQL,
		N'@tableName NVARCHAR(1000), @list_location_table_cols_query NVARCHAR(MAX) OUTPUT',
		@tableName = @listLocationTableName,
		@list_location_table_cols_query = @list_location_table_cols_output OUTPUT

	-- Add JSON attributes for version 2+ - COMPLETELY DISABLED FOR NOW
	DECLARE @jsonColumnsWithAlias NVARCHAR(MAX) = ''
	-- IF @listVersion >= 2 AND @jsonAttributeColumns IS NOT NULL AND @jsonAttributeColumns <> ''
	-- BEGIN
	-- 	-- Simple approach: build JSON columns directly
	-- 	SELECT @jsonColumnsWithAlias = STUFF((
	-- 		SELECT ', JSON_VALUE(lt.attributes, ''$."' + REPLACE(TRIM(value), '''', '''''') + '"'') AS [' + TRIM(value) + '_attr]'
	-- 		FROM STRING_SPLIT(@jsonAttributeColumns, ',')
	-- 		WHERE TRIM(value) <> ''
	-- 		FOR XML PATH('')
	-- 	), 1, 2, '')
	-- END

	-- Get analysis table columns
	EXEC sp_executesql
		N'SELECT @analysis_location_table_cols_query = STUFF((
			SELECT '', ['' + [name] + '']'' FROM sys.columns
			WHERE [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @tableName)
			AND [name] NOT IN (''Geometry'')
			FOR XML PATH('''')
		),1,2,'''')',
		N'@tableName NVARCHAR(1000), @analysis_location_table_cols_query NVARCHAR(MAX) OUTPUT',
		@tableName = @listAnalysisTableName,
		@analysis_location_table_cols_query = @analysis_location_table_cols_output OUTPUT

	-- Build location filters
	IF @Country IS NOT NULL SET @Filters = @Filters + ' AND Country = @Country'
	IF @State IS NOT NULL SET @Filters = @Filters + ' AND State = @State'
	IF @SubState IS NOT NULL SET @Filters = @Filters + ' AND [Sub State] = @SubState'
	IF @selectedSupplier IS NOT NULL SET @Filters = @Filters + ' AND [Supplier Name] = @selectedSupplier'
	IF @selectedSecondSupplier IS NOT NULL SET @Filters = @Filters + ' AND [Second Supplier Name] = @selectedSecondSupplier'
	IF @selectedParentCompany IS NOT NULL SET @Filters = @Filters + ' AND [Parent Company] = @selectedParentCompany'
	IF @showRSPOCertified = 1 SET @Filters = @Filters + ' AND [RSPO Model] = 1'

	-- Handle location logic
	IF @LocationLogic IS NOT NULL AND @LocationIds IS NOT NULL
	BEGIN
		IF CHARINDEX('IN', @LocationLogic) > 0
			SET @Filters = @Filters + ' AND location_id ' + @LocationLogic + ' (' + @LocationIds + ')'
		ELSE IF CHARINDEX('BETWEEN', @LocationLogic) > 0
		BEGIN
			DECLARE @betweenClause NVARCHAR(MAX) = ''
			SELECT @betweenClause = STUFF((
				SELECT ' AND location_id ' + @LocationLogic + ' ' + locations
				FROM (SELECT value AS locations FROM STRING_SPLIT(@LocationIds, ',')) AS LocationIdsCTE
				FOR XML PATH('')
			), 1, 4, '')
			SET @Filters = @Filters + ' AND location_id ' + @LocationLogic + ' ' + @betweenClause
		END
	END

	-- Handle search string
	IF @SearchString IS NOT NULL
	BEGIN
		DECLARE @listLocationTableCols NVARCHAR(MAX)
		SELECT @listLocationTableCols = STUFF((
			SELECT '], [' + [name] FROM sys.columns
			WHERE [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
			AND [name] NOT IN ('Geometry', 'location_id')
			AND user_type_id IN (SELECT user_type_id FROM sys.types WHERE name IN ('char', 'nchar', 'varchar', 'nvarchar'))
			FOR XML PATH('')
		),1,3,' ') + ']'

		SET @Filters = @Filters + ' AND CONCAT(' + @listLocationTableCols + ') LIKE ''%' + @SearchString + '%'''
	END

	-- Handle analysis area filters
	IF ISNUMERIC(@AnalysisAreaMin) = 1 AND ISNUMERIC(@AnalysisAreaMax) = 1
	BEGIN
		IF @AnalysisAreaMin < 0 OR @AnalysisAreaMax < 0
			RAISERROR ('Invalid analysis area values', -1, 1)
		SET @AnalysisFilters = 'total_area BETWEEN ' + CAST(@AnalysisAreaMin AS NVARCHAR(20)) + ' AND ' + CAST(@AnalysisAreaMax AS NVARCHAR(20))
	END

	-- Handle JSON-based filters
	IF @selectedOverallThreats IS NOT NULL
		SET @where_clauses = '(SELECT TOP 1 CAST(value AS INT) FROM OPENJSON(commodity_threat_overall_level) WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_threat_overall_level) ORDER BY [key] DESC) AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallThreats))) IS NOT NULL'

	IF @selectedOverallValues IS NOT NULL
	BEGIN
		IF @where_clauses <> '' SET @where_clauses = @where_clauses + ' AND '
		SET @where_clauses = @where_clauses + '(SELECT TOP 1 CAST(value AS INT) FROM OPENJSON(commodity_value_overall_level) WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_value_overall_level) ORDER BY [key] DESC) AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallValues))) IS NOT NULL'
	END

	IF @selectedMillPriority IS NOT NULL
	BEGIN
		IF @where_clauses <> '' SET @where_clauses = @where_clauses + ' AND '
		SET @where_clauses = @where_clauses + '(SELECT TOP 1 CAST(value AS INT) FROM OPENJSON(commodity_mill_priority_level) WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_mill_priority_level) ORDER BY [key] DESC) AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedMillPriority))) IS NOT NULL'
	END

	IF @where_clauses <> '' SET @AnalysisFilters = @AnalysisFilters + ' AND ' + @where_clauses

	-- Build parsed JSON columns using STUFF instead of STRING_AGG
	DECLARE @parsedColumns NVARCHAR(MAX) = ''
	SELECT @parsedColumns = STUFF((
		SELECT ', (SELECT TOP 1 CAST(value AS INT) FROM OPENJSON(' + ColumnName + ') ORDER BY [key] DESC) AS ' + ColumnName + '_parsed'
		FROM (VALUES
			('commodity_threat_deforestation_level'), ('commodity_threat_peat_level'), ('commodity_threat_protected_areas_level'),
			('commodity_threat_fires_level'), ('commodity_value_forest_extent_level'), ('commodity_value_peat_level'),
			('commodity_value_protected_areas_level'), ('commodity_value_overall_level'), ('commodity_threat_overall_level'),
			('commodity_mill_priority_level')
		) AS jsonColumns(ColumnName)
		FOR XML PATH('')
	), 1, 2, '')

	-- Build ORDER BY clause first
	DECLARE @OrderByClause NVARCHAR(MAX)
	SET @OrderByClause = CASE
		WHEN @OrderByColumn IN ('Location Name', '[Location Name]') THEN '[Location Name]'
		WHEN @OrderByColumn IN ('Investment Name', '[Investment Name]') THEN '[Investment Name]'
		WHEN CHARINDEX(@OrderByColumn, @list_location_table_cols_output) > 0 THEN QUOTENAME(REPLACE(REPLACE(@OrderByColumn, '[', ''), ']', ''))
		WHEN CHARINDEX(@OrderByColumn, @analysis_location_table_cols_output) > 0 THEN QUOTENAME(@cleanedOrderByColumn)
		ELSE 'list_location_id'
	END + ' ' + @Order

	-- Ensure all variables have proper values before replacement
	IF @list_location_table_cols_output IS NULL SET @list_location_table_cols_output = ''
	IF @analysis_location_table_cols_output IS NULL SET @analysis_location_table_cols_output = ''
	IF @parsedColumns IS NULL SET @parsedColumns = ''
	IF @AnalysisFilters IS NULL SET @AnalysisFilters = '1=1'
	IF @Filters IS NULL SET @Filters = ''

	-- Clean up any trailing commas
	SET @list_location_table_cols_output = RTRIM(LTRIM(@list_location_table_cols_output))
	IF RIGHT(@list_location_table_cols_output, 1) = ','
		SET @list_location_table_cols_output = LEFT(@list_location_table_cols_output, LEN(@list_location_table_cols_output) - 1)

	SET @analysis_location_table_cols_output = RTRIM(LTRIM(@analysis_location_table_cols_output))
	IF RIGHT(@analysis_location_table_cols_output, 1) = ','
		SET @analysis_location_table_cols_output = LEFT(@analysis_location_table_cols_output, LEN(@analysis_location_table_cols_output) - 1)

	SET @parsedColumns = RTRIM(LTRIM(@parsedColumns))
	IF RIGHT(@parsedColumns, 1) = ','
		SET @parsedColumns = LEFT(@parsedColumns, LEN(@parsedColumns) - 1)

	-- Debug: Print the column outputs to identify the issue
	PRINT 'Location columns: ' + ISNULL(@list_location_table_cols_output, 'NULL')
	PRINT 'Analysis columns: ' + ISNULL(@analysis_location_table_cols_output, 'NULL')
	PRINT 'Parsed columns: ' + ISNULL(@parsedColumns, 'NULL')
	PRINT 'Order by clause: ' + ISNULL(@OrderByClause, 'NULL')
	PRINT 'Location columns length: ' + CAST(LEN(ISNULL(@list_location_table_cols_output, '')) AS NVARCHAR(10))
	PRINT 'Analysis columns length: ' + CAST(LEN(ISNULL(@analysis_location_table_cols_output, '')) AS NVARCHAR(10))
	PRINT 'Parsed columns length: ' + CAST(LEN(ISNULL(@parsedColumns, '')) AS NVARCHAR(10))

	-- Build and execute final query using template replacement
	SET @SQL = N'
	WITH MyListTable AS (
		SELECT ' + CAST(@listID AS NVARCHAR(20)) + ' As list_id' +
		CASE WHEN @list_location_table_cols_output IS NOT NULL AND LEN(TRIM(@list_location_table_cols_output)) > 0
			THEN ', ' + @list_location_table_cols_output
			ELSE ''
		END +
		', location_id as list_location_id' +
		CASE WHEN @Geometry = 1 THEN ', Geometry.ToString() As [WKTGeometry]' ELSE '' END + '
		FROM [' + @listLocationTableName + '] lt
	), MyAnalysisTable AS (
		SELECT ' + CAST(@listID AS NVARCHAR(20)) + ' As analysis_list_id, ' + CAST(@template_id AS NVARCHAR(20)) + ' As template_id' +
		CASE WHEN @analysis_location_table_cols_output IS NOT NULL AND LEN(TRIM(@analysis_location_table_cols_output)) > 0
			THEN ', ' + @analysis_location_table_cols_output
			ELSE ''
		END +
		CASE WHEN @parsedColumns IS NOT NULL AND LEN(TRIM(@parsedColumns)) > 0
			THEN ', ' + @parsedColumns
			ELSE ''
		END + '
		FROM [' + @listAnalysisTableName + '] A
		WHERE ' + @AnalysisFilters + '
	), CombinedData AS (
		SELECT MyListTable.*, MyAnalysisTable.*, ROW_NUMBER() OVER (ORDER BY ' + @OrderByClause + ') AS RowNum
		FROM MyListTable
		INNER JOIN MyAnalysisTable ON MyListTable.list_id = MyAnalysisTable.analysis_list_id AND MyListTable.list_location_id = MyAnalysisTable.location_id
		WHERE 1=1 ' + @Filters + '
	)
	SELECT
		list_id, list_location_id' +
		CASE WHEN @list_location_table_cols_output IS NOT NULL AND LEN(TRIM(@list_location_table_cols_output)) > 0
			THEN ', ' + @list_location_table_cols_output
			ELSE ''
		END +
		CASE WHEN @Geometry = 1 THEN ', [WKTGeometry]' ELSE '' END + ',
		analysis_list_id, template_id' +
		CASE WHEN @analysis_location_table_cols_output IS NOT NULL AND LEN(TRIM(@analysis_location_table_cols_output)) > 0
			THEN ', ' + @analysis_location_table_cols_output
			ELSE ''
		END +
		CASE WHEN @parsedColumns IS NOT NULL AND LEN(TRIM(@parsedColumns)) > 0
			THEN ', ' + @parsedColumns
			ELSE ''
		END + '
	FROM CombinedData
	WHERE 1=1 ' +
	CASE WHEN @RowsOfPage > 0 AND @PageNumber > 0
		THEN ' AND RowNum BETWEEN ' + CAST((@PageNumber-1)*@RowsOfPage + 1 AS NVARCHAR(20)) + ' AND ' + CAST(@PageNumber*@RowsOfPage AS NVARCHAR(20))
		ELSE ''
	END

	-- Debug: Print the final SQL to identify the issue
	PRINT 'Final SQL: ' + @SQL

	EXEC sp_executesql @SQL,
		N'@PageNumber INT, @RowsOfPage INT, @OrderByColumn NVARCHAR(MAX), @Order NVARCHAR(5), @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT, @selectedSupplier NVARCHAR(150), @selectedSecondSupplier NVARCHAR(150), @selectedParentCompany NVARCHAR(150), @showRSPOCertified BIT, @selectedOverallThreats NVARCHAR(150), @selectedOverallValues NVARCHAR(150), @selectedMillPriority NVARCHAR(150), @jsonAttributeColumns NVARCHAR(MAX)',
		@PageNumber, @RowsOfPage, @OrderByColumn, @Order, @Country, @State, @SubState, @AnalysisAreaMin, @AnalysisAreaMax, @selectedSupplier, @selectedSecondSupplier, @selectedParentCompany, @showRSPOCertified, @selectedOverallThreats, @selectedOverallValues, @selectedMillPriority, @jsonAttributeColumns

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
  arg_otbn_area: string;
  argentina_presence: string;
}