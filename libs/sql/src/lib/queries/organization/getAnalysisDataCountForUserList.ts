export const getAnalysisDataCountForUserList = `
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listAnalysisTableName NVARCHAR(1000)
DECLARE @CTE NVARCHAR(MAX)
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @Filters NVARCHAR(MAX) = ''
DECLARE @AnalysisFilters NVARCHAR(MAX) = ''
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @where_clauses NVARCHAR(max) = '';

-- Find the issue in this code

SELECT @listLocationTableName = list_table_name, @listAnalysisTableName = list_analysis_table_name FROM dbo.Lists WHERE id = @listID

	BEGIN

		SET @CTE = 'SELECT L.location_id FROM dbo.[{LIST_TABLE_NAME}] L'

		--- SET FILTERS
		IF @Country IS NOT NULL
			SET @Filters = + @Filters + ' AND Country = @Country'

		IF @State IS NOT NULL
			SET @Filters = + @Filters + ' AND State = @State'

		IF @SubState IS NOT NULL
			SET @Filters = + @Filters + ' AND [Sub State] = @SubState'
        IF @selectedSupplier IS NOT NULL
            SET @Filters = + @Filters + ' AND [Supplier Name] = @selectedSupplier'
        IF @selectedSecondSupplier IS NOT NULL
            SET @Filters = + @Filters + ' AND [Second Supplier Name] = @selectedSecondSupplier'
        IF @selectedParentCompany IS NOT NULL
            SET @Filters = + @Filters + ' AND [Parent Company] = @selectedParentCompany'
        IF @showRSPOCertified = 1
            SET @Filters = + @Filters + ' AND [RSPO Model] = 1'

		IF @SearchString IS NOT NULL
		BEGIN
			SELECT @listLocationTableCols = STUFF(
			  (
				SELECT '], L.[' + [name] FROM sys.columns
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

		IF @AnalysisAreaMin IS NOT NULL AND @AnalysisAreaMax IS NOT NULL
		BEGIN
			IF @AnalysisAreaMin < 0 AND @AnalysisAreaMin < @AnalysisAreaMax
				BEGIN
					RAISERROR ('Invalid @AnalysisAreaMin', -1, 1);
				END
			IF @AnalysisAreaMax < 0 AND @AnalysisAreaMax > @AnalysisAreaMin
				BEGIN
					RAISERROR ('Invalid @AnalysisAreaMax', -1, 1);
				END
			SET @AnalysisFilters = ' INNER JOIN (
				SELECT location_id FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}]
				WHERE total_area BETWEEN {ANALYSIS_AREA_MIN} AND {ANALYSIS_AREA_MAX}
				) A ON A.location_id = L.location_id';
			SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{ANALYSIS_AREA_MIN}', @AnalysisAreaMin);
			SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{ANALYSIS_AREA_MAX}', @AnalysisAreaMax);
			SET @AnalysisFilters = REPLACE(@AnalysisFilters, '{LIST_ANALYSIS_TABLE_NAME}', @listAnalysisTableName)
		END

    IF @selectedOverallThreats IS NOT NULL
    BEGIN
        set @where_clauses = '(SELECT TOP 1 CAST(value AS INT) AS last_property
                                FROM OPENJSON(commodity_threat_overall_level)
                                WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_threat_overall_level) ORDER BY [key] DESC)
                                AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallThreats))) IS NOT NULL'
    END
    IF @selectedOverallValues IS NOT NULL
    BEGIN
        IF @where_clauses <> ''
            SET @where_clauses = @where_clauses + ' AND ';

                set @where_clauses = @where_clauses + '(SELECT TOP 1 CAST(value AS INT) AS last_property
                                FROM OPENJSON(commodity_value_overall_level)
                                WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_value_overall_level) ORDER BY [key] DESC)
                                AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedOverallValues))) IS NOT NULL'

    END
    IF @selectedMillPriority IS NOT NULL
    BEGIN
        IF @where_clauses <> ''
            SET @where_clauses = @where_clauses + ' AND ';
        set @where_clauses = @where_clauses + '(SELECT TOP 1 CAST(value AS INT) AS last_property
                            FROM OPENJSON(commodity_mill_priority_level)
                            WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(commodity_mill_priority_level) ORDER BY [key] DESC)
                            AND CAST(value AS INT) IN (SELECT CAST(value AS INT) FROM OPENJSON(@selectedMillPriority))) IS NOT NULL'

    END
			IF @where_clauses <> ''
			SET @CTE = @CTE + @AnalysisFilters + ' WHERE L.location_id IN
          (
         SELECT DISTINCT A.location_id
        FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}] A
        WHERE '+ @where_clauses +' ) ' + @Filters;
		ELSE
			SET @CTE = @CTE + @AnalysisFilters + ' WHERE 1=1' + @Filters;

		SET @CTE = REPLACE(@CTE, '{LIST_TABLE_NAME}', @listLocationTableName)

		SET @TEMPLATE = 'WITH Locations_CTE AS ( {LOCATION_CTE} )

			SELECT ''Row Count'' AS statistic_type, COUNT(location_id) AS statistic
			FROM Locations_CTE
			UNION ALL
			SELECT ''Max Area'', ISNULL(MAX(total_area),0)
			FROM dbo.[{LIST_ANALYSIS_TABLE_NAME}]
			WHERE {WHERE_CLAUSES}'

		IF @where_clauses = ''
			SET @where_clauses = '1=1'
		SET @TEMPLATE = REPLACE(@TEMPLATE, '{WHERE_CLAUSES}', @where_clauses)

		SET @SQL = REPLACE(@TEMPLATE, '{LOCATION_CTE}', @CTE)
		SET @SQL = REPLACE(@SQL, '{LIST_ANALYSIS_TABLE_NAME}', @listAnalysisTableName)
		PRINT @SQL
		EXEC sp_executesql @SQL,
				N'@Country NVARCHAR(150), @State NVARCHAR(150), @SubState NVARCHAR(150), @AnalysisAreaMin INT, @AnalysisAreaMax INT,@selectedSupplier NVARCHAR(150),@selectedSecondSupplier NVARCHAR(150),@selectedParentCompany NVARCHAR(150),@showRSPOCertified BIT,@selectedOverallThreats NVARCHAR(150),@selectedOverallValues NVARCHAR(150),@selectedMillPriority NVARCHAR(150)',
				@Country=@Country, @State=@State, @SubState=@SubState, @AnalysisAreaMin=@AnalysisAreaMin, @AnalysisAreaMax=@AnalysisAreaMax, @selectedSupplier=@selectedSupplier,@selectedSecondSupplier=@selectedSecondSupplier,@selectedParentCompany=@selectedParentCompany,@showRSPOCertified=@showRSPOCertified,@selectedOverallThreats=@selectedOverallThreats,@selectedOverallValues=@selectedOverallValues,@selectedMillPriority=@selectedMillPriority;
  END
`;

export interface AnalysisDataCountType {
  statistic_type: string;
  statistic: number;
}
