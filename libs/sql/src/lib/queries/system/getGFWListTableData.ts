export const getGFWListTableData = `
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listAnalysisTableName NVARCHAR(1000)
DECLARE @CommonTableExpression NVARCHAR(MAX)
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @Filters NVARCHAR(MAX) = ''
DECLARE @where_clauses NVARCHAR(MAX) = '1=1' -- Initialize @where_clauses to a neutral condition so we can always append with AND.
DECLARE @skip INT
SET @skip = @pageNum * @pageSize

DECLARE @analysisColumns NVARCHAR(MAX) = '
location_status_id,
tree_cover_loss_total_yearly,
tree_cover_loss_primary_forest_yearly,
tree_cover_loss_peat_yearly,
tree_cover_loss_intact_forest_yearly,
tree_cover_loss_protected_areas_yearly,
tree_cover_loss_sea_landcover_yearly,
tree_cover_loss_idn_landcover_yearly,
tree_cover_loss_idn_primary_forest_yearly,
tree_cover_loss_soy_yearly,
tree_cover_loss_idn_legal_yearly,
tree_cover_loss_idn_forest_moratorium_yearly,
tree_cover_loss_prodes_yearly,
tree_cover_loss_prodes_wdpa_yearly,
tree_cover_loss_prodes_primary_forest_yearly,
tree_cover_loss_brazil_biomes_yearly,
tree_cover_extent_total,
tree_cover_extent_primary_forest,
tree_cover_extent_protected_areas,
tree_cover_extent_peat,
tree_cover_extent_intact_forest,
natural_habitat_primary,
natural_habitat_intact_forest,
natural_habitat_global_land_cover,
total_area,
protected_areas_area,
critical_habitat_alliance_zero,
indigenous_people_land_rights,
peat_area,
fires_counts_monthly,
soy_total_area,
soy_pre2001_nonforest_area,
brazil_biomes,
idn_legal_area,
sea_landcover_area,
idn_forest_moratorium_area,
south_america_presence,
legal_amazon_presence,
brazil_biomes_presence,
cerrado_biome_presence,
southeast_asia_presence,
indonesia_presence,
commodity_threat_overall_level,
commodity_threat_overall_score,
commodity_value_overall_level,
commodity_value_overall_score,
commodity_value_forest_extent,
commodity_value_peat,
commodity_value_protected_areas,
commodity_mill_priority_level,
commodity_mill_priority_score,
commodity_threat_deforestation,
commodity_threat_peat,
commodity_threat_protected_areas,
commodity_threat_fires,
dissolved_data_location_info,
tree_cover_loss_arg_otbn_yearly,
arg_otbn_area,
protected_areas_by_category_area,
landmark_by_category_area,
country_specific_deforestation_yearly,
country_specific_deforestation_wdpa_yearly,
country_specific_deforestation_landmark_yearly,
country_specific_deforestation_classified_region_yearly,
tree_cover_loss_by_country_yearly,
tree_cover_loss_by_country_wdpa_yearly,
tree_cover_loss_by_country_landmark_yearly,
country_area,
classified_region_area,
tree_cover_loss_by_country_classified_region_yearly'


-- Remove line breaks and carriage returns
SET @analysisColumns = REPLACE(@analysisColumns, CHAR(10), '');
SET @analysisColumns = REPLACE(@analysisColumns, CHAR(13), '');

-- Remove tabulations
SET @analysisColumns = REPLACE(@analysisColumns, CHAR(9), '');

-- Remove leading and trailing spaces
SET @analysisColumns = LTRIM(RTRIM(@analysisColumns));


-- Get the location and analysis table names from the GFWLists table based on listID
SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name
FROM GFWLists
WHERE id = @listID


-- Now @analysisColumns becomes: [ListAnalysis].[column1], [ListAnalysis].[column2], [ListAnalysis].[column3]
SET @analysisColumns = '[' + @listAnalysisTableName + '].[' + REPLACE(LTRIM(RTRIM(REPLACE(@analysisColumns, ', ', ','))), ',', '], [' + @listAnalysisTableName + '].[') + ']';


DECLARE @jsonColumns TABLE (ColumnName NVARCHAR(255));

-- Add all columns that need parsing
INSERT INTO @jsonColumns (ColumnName)
VALUES
    ('commodity_threat_deforestation_level'),
    ('commodity_threat_peat_level'),
    ('commodity_threat_protected_areas_level'),
    ('commodity_threat_fires_level'),
    ('commodity_value_forest_extent_level'),
    ('commodity_value_peat_level'),
    ('commodity_value_protected_areas_level'),
    ('commodity_value_overall_level'),
    ('commodity_threat_overall_level'),
    ('commodity_mill_priority_level');

DECLARE @parsedColumns NVARCHAR(MAX) = '';

DECLARE @columnName NVARCHAR(255);
DECLARE column_cursor CURSOR FOR SELECT ColumnName FROM @jsonColumns;

OPEN column_cursor;
FETCH NEXT FROM column_cursor INTO @columnName;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @parsedColumn NVARCHAR(MAX);

    SET @parsedColumn = '
        (SELECT TOP 1 CAST(value AS INT)
         FROM OPENJSON([' + @listAnalysisTableName + '].' + @columnName + ')
         ORDER BY [key] DESC
        ) AS ' + @columnName + '_parsed';

    -- Append to @parsedColumns
    IF @parsedColumns = ''
        SET @parsedColumns = @parsedColumn;
    ELSE
        SET @parsedColumns = @parsedColumns + ', ' + @parsedColumn;

    FETCH NEXT FROM column_cursor INTO @columnName;
END

CLOSE column_cursor;
DEALLOCATE column_cursor;


-- Append the dynamically generated parsed columns
SET @analysisColumns = @analysisColumns + ', ' + @parsedColumns;


-- Begin constructing the main CommonTableExpression
SET @CommonTableExpression = 'SELECT [' + @listLocationTableName + '].*, ' + @analysisColumns + '
FROM [' + @listLocationTableName + ']
LEFT JOIN [' + @listAnalysisTableName + '] ON [' + @listAnalysisTableName + '].location_id = [' + @listLocationTableName + '].location_id'

-- Add simple filters
IF @Country IS NOT NULL
  SET @Filters = @Filters + ' AND Country = @Country'
IF @State IS NOT NULL
  SET @Filters = @Filters + ' AND State = @State'
IF @SubState IS NOT NULL
  SET @Filters = @Filters + ' AND [Sub State] = @SubState'
IF @filterString IS NOT NULL
  SET @Filters = @Filters + ' AND (Country LIKE ''%'' + @filterString + ''%'' OR State LIKE ''%'' + @filterString + ''%'' OR [Location Name] LIKE ''%'' + @filterString + ''%'')'

-- Add the complex filter for selectedOverallValues (applied on the analysis table)
IF @selectedOverallValues IS NOT NULL
BEGIN
    SET @where_clauses = @where_clauses + ' AND (SELECT TOP 1 CAST(value AS INT)
      FROM OPENJSON([' + @listAnalysisTableName + '].commodity_value_overall_level)
      WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON([' + @listAnalysisTableName + '].commodity_value_overall_level) ORDER BY [key] DESC)
        AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallValues))
    ) IS NOT NULL'
END

IF @selectedOverallThreats IS NOT NULL
BEGIN
  SET @where_clauses = @where_clauses + ' AND (SELECT TOP 1 CAST(value AS INT)
        FROM OPENJSON([' + @listAnalysisTableName + '].commodity_threat_overall_level)
        WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON([' + @listAnalysisTableName + '].commodity_threat_overall_level) ORDER BY [key] DESC)
        AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallThreats))
    ) IS NOT NULL'
END

IF @selectedMillPriority IS NOT NULL
BEGIN
  SET @where_clauses = @where_clauses + ' AND (SELECT TOP 1 CAST(value AS INT)
        FROM OPENJSON([' + @listAnalysisTableName + '].commodity_mill_priority_level)
        WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON([' + @listAnalysisTableName + '].commodity_mill_priority_level) ORDER BY [key] DESC)
        AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedMillPriority))
    ) IS NOT NULL'
END

-- Combine filters into the CommonTableExpression query
SET @CommonTableExpression = @CommonTableExpression + ' WHERE ' + @where_clauses + @Filters

-- Template for pagination: use OFFSET-FETCH and attach the CommonTableExpression
SET @TEMPLATE = 'WITH Locations_CTE AS ( {LOCATION_COMMON_TABLE_EXPRESSION} )
SELECT *, {listID} AS list_id, COUNT(*) OVER() AS total_count
FROM Locations_CTE
ORDER BY [{ORDER_COLUMN}] {ORDER_DIR}
OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY;
'

-- Validate the order-by column: if not specified, default to location_id
IF @tableSortedBy IS NULL OR @tableSortedBy = ''
  SET @tableSortedBy = 'location_id'

-- Replace placeholders in the template
SET @TEMPLATE = REPLACE(@TEMPLATE, '{LOCATION_COMMON_TABLE_EXPRESSION}', @CommonTableExpression)
SET @TEMPLATE = REPLACE(@TEMPLATE, '{ORDER_COLUMN}', @tableSortedBy)
SET @TEMPLATE = REPLACE(@TEMPLATE, '{ORDER_DIR}', @tableSortedDesc)
SET @TEMPLATE = REPLACE(@TEMPLATE, '{listID}', @listID)

SET @SQL = @TEMPLATE

EXEC sp_executesql @SQL,
  N'@skip INT, @take INT, @Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150),
    @filterString NVARCHAR(150), @selectedOverallValues NVARCHAR(MAX), @selectedOverallThreats NVARCHAR(MAX), @selectedMillPriority NVARCHAR(MAX), @analysisColumns NVARCHAR(MAX)',
  @skip = @skip,
  @take = @pageSize,
  @Country = @Country,
  @State = @State,
  @SubState = @SubState,
  @filterString = @filterString,
  @selectedOverallValues = @selectedOverallValues,
  @selectedOverallThreats = @selectedOverallThreats,
  @selectedMillPriority = @selectedMillPriority,
  @analysisColumns = @analysisColumns
`;
