export const getAnalysisDataCountForUserList = `-- Variables
DECLARE @listLocationTableName NVARCHAR(1000);
DECLARE @listAnalysisTableName NVARCHAR(1000);
DECLARE @CTE NVARCHAR(MAX);
DECLARE @TEMPLATE NVARCHAR(MAX);
DECLARE @SQL NVARCHAR(MAX);
DECLARE @Filters NVARCHAR(MAX) = '';
DECLARE @AnalysisFilters NVARCHAR(MAX) = '';
DECLARE @listLocationTableCols NVARCHAR(MAX);

-- Set the table names
SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM dbo.Lists WHERE id = @listID;

-- Build the CTE
SET @CTE = 'SELECT L.location_id FROM dbo.[{LIST_TABLE_NAME}] L';

-- Set Filters
IF @Country IS NOT NULL
BEGIN
    SET @Filters = @Filters + ' AND Country = @Country';
END;

IF @State IS NOT NULL
BEGIN
    SET @Filters = @Filters + ' AND State = @State';
END;

IF @SubState IS NOT NULL
BEGIN
    SET @Filters = @Filters + ' AND [Sub State] = @SubState';
END;

IF @SearchString IS NOT NULL
BEGIN
    SELECT @listLocationTableCols = GROUP_CONCAT('], L.[', [name]) FROM pragma_table_info(@listLocationTableName) WHERE [name] NOT IN ('Geometry', 'location_id') AND type IN ('char', 'nchar', 'varchar', 'nvarchar');

    DECLARE @SearchLogic NVARCHAR(MAX) = 'GROUP_CONCAT({LIST_TABLE_CHAR_COLS}) LIKE ''%{SEARCH_STRING}%'' ';
    SET @SearchLogic = REPLACE(@SearchLogic, '{LIST_TABLE_CHAR_COLS}', @listLocationTableCols);
    SET @SearchLogic = REPLACE(@SearchLogic, '{SEARCH_STRING}', @SearchString);
    SET @Filters = CONCAT(@Filters, ' AND ', @SearchLogic);
END;

IF @AnalysisAreaMin IS NOT NULL AND @AnalysisAreaMax IS NOT NULL
BEGIN
    IF @AnalysisAreaMin < 0 AND @AnalysisAreaMin < @AnalysisAreaMax
    BEGIN
        -- Handle invalid @AnalysisAreaMin
    END;

    IF @AnalysisAreaMax < 0 AND @AnalysisAreaMax > @AnalysisAreaMin
    BEGIN
        -- Handle invalid @AnalysisAreaMax
    END;

    SET @AnalysisFilters = ' INNER JOIN (
        SELECT location_id FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}]
        WHERE total_area BETWEEN {ANALYSIS_AREA_MIN} AND {ANALYSIS_AREA_MAX}
        ) A ON A.location_id = L.location_id';
    SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{ANALYSIS_AREA_MIN}', @AnalysisAreaMin);
    SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{ANALYSIS_AREA_MAX}', @AnalysisAreaMax);
    SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{LIST_ANALYSIS_TABLE_NAME}', @listAnalysisTableName);
END;

SET @CTE = @CTE + @AnalysisFilters + ' WHERE 1=1' + @Filters;
SET @CTE = REPLACE(@CTE, '{LIST_TABLE_NAME}', @listLocationTableName);

SET @TEMPLATE = 'WITH Locations_CTE AS ( {LOCATION_CTE} )
    SELECT ''Row Count'' AS statistic_type, COUNT(location_id) AS statistic
    FROM Locations_CTE
    UNION ALL
    SELECT ''Max Area'', MAX(total_area)
    FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}]';

SET @SQL = REPLACE(@TEMPLATE, '{LOCATION_CTE}', @CTE);
SET @SQL = REPLACE(@SQL, '{LIST_ANALYSIS_TABLE_NAME}', @listAnalysisTableName);

-- Execute the query
EXECUTE (@SQL);
`;

export type GetAnalysisDataCountForUserListResponse = [
  { statistic_type: 'Row Count'; statistic: number },
  { statistic_type: 'Max Area'; statistic: number }
];

/**
 * @deprecated path with greater resistance
 * @note Replace {FILTERS} with AND conditions to apply SQL filters
 * @note Replace [LIST_TABLE_NAME] with name of the list table
 * @note Replace [LIST_ANALYSIS_TABLE_NAME] with name of the list analysis table.
 */
export const getAnalysisDataCountForUserListSQLite = `WITH Locations_CTE AS (
  SELECT L.location_id
  FROM [LIST_TABLE_NAME] L
  WHERE 1=1
  {FILTERS}
    AND (
      {LIST_TABLE_CHAR_COLS} LIKE '%' || {SEARCH_STRING} || '%'
    )
)
SELECT 'Row Count' AS statistic_type, COUNT(location_id) AS statistic
FROM Locations_CTE
UNION ALL
SELECT 'Max Area', MAX(total_area)
FROM [LIST_ANALYSIS_TABLE_NAME]
WHERE location_id IN (SELECT location_id FROM Locations_CTE);`;
