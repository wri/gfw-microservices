/**
 * This query gets paginated Alerts Analysis for a list by location
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 * @startDate AS DATE (optional)
 * @endDate AS DATE (optional)
 */
export const getPaginatedAlertsAnalysisByListIdSortedByFilters = `
DECLARE @list_table NVARCHAR(150);
DECLARE @listName  NVARCHAR(150);
DECLARE @listVersion INT;
DECLARE @SQL NVARCHAR(MAX);
DECLARE @Filters NVARCHAR(MAX) = '';
DECLARE @AnalysisFilters NVARCHAR(MAX) = '1=1';
DECLARE @where_clauses NVARCHAR(max) = '';
DECLARE @listLocationTableCols NVARCHAR(MAX);
DECLARE @listLocationTableName NVARCHAR(1000);
DECLARE @dateFilteredAlertsSQL NVARCHAR(MAX) = '';
DECLARE @unionClauses NVARCHAR(MAX) = '';

DECLARE @alertsColumns NVARCHAR(MAX) = 'location_id, gadm_id, viirs_alerts_daily, tree_cover_extent_total, integrated_alerts_coverage, total_ha, integrated_alerts_daily_all_nominal, integrated_alerts_daily_all_high, integrated_alerts_daily_all_highest, integrated_alerts_daily_sbtn_nominal, integrated_alerts_daily_sbtn_high, integrated_alerts_daily_sbtn_highest, integrated_alerts_daily_jrc_nominal, integrated_alerts_daily_jrc_high, integrated_alerts_daily_jrc_highest, status_code, location_error, intdist_alerts_area_sbtn_natural_nominal, intdist_alerts_area_sbtn_natural_high, intdist_alerts_area_sbtn_natural_highest, intdist_alerts_area_jrc_nominal, intdist_alerts_area_jrc_high, intdist_alerts_area_jrc_highest, intdist_alerts_area_all_nominal, intdist_alerts_area_all_high, intdist_alerts_area_all_highest';
DECLARE @ltColumns NVARCHAR(MAX) = '[Location Name], Country, State, [Sub State]';
DECLARE @calculatedColumns NVARCHAR(MAX) = '';

-- Define the JSON fields that need date-based aggregation
DECLARE @DateBasedFields TABLE (FieldName NVARCHAR(128));
INSERT INTO @DateBasedFields (FieldName) VALUES
('integrated_alerts_daily_all_nominal'),
('integrated_alerts_daily_all_high'),
('integrated_alerts_daily_all_highest'),
('integrated_alerts_daily_sbtn_nominal'),
('integrated_alerts_daily_sbtn_high'),
('integrated_alerts_daily_sbtn_highest'),
('integrated_alerts_daily_jrc_nominal'),
('integrated_alerts_daily_jrc_high'),
('integrated_alerts_daily_jrc_highest'),
('intdist_alerts_area_sbtn_natural_forests_nominal'),
('intdist_alerts_area_sbtn_natural_forests_high'),
('intdist_alerts_area_sbtn_natural_forests_highest'),
('intdist_alerts_area_sbtn_natural_ecosystem_nominal'),
('intdist_alerts_area_sbtn_natural_ecosystem_high'),
('intdist_alerts_area_sbtn_natural_ecosystem_highest'),
('intdist_alerts_area_jrc_nominal'),
('intdist_alerts_area_jrc_high'),
('intdist_alerts_area_jrc_highest'),
('intdist_alerts_area_all_nominal'),
('intdist_alerts_area_all_high'),
('intdist_alerts_area_all_highest');

SELECT
    @list_table = [list_table_name],
    @listName   = [list_Name],
    @listVersion= [version]
FROM [Lists]
WHERE id = @listId;

DECLARE @locationColumns NVARCHAR(MAX) = '';

DECLARE @OptionalColumns TABLE (ColumnName NVARCHAR(255));
INSERT INTO @OptionalColumns (ColumnName)
VALUES
    ('Latitude'),
    ('Longitude'),
    ('Volume'),
    ('Certification'),
    ('Company ID'),
    ('Time Horizon'),
    ('Start Date'),
    ('End Date'),
    ('Supplier Name'),
    ('Facility Name'),
    ('Refinery Name'),
    ('Owner Name'),
    ('Owner ID'),
    ('Company Name'),
    ('Analysis Radius'),
    ('Analysis Area');

SELECT @locationColumns +=
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @list_table
              AND COLUMN_NAME = ColumnName
        )
        THEN ' lt.' + QUOTENAME(ColumnName) + ' AS ' + QUOTENAME(ColumnName) + ', '
        ELSE ''
    END
FROM @OptionalColumns;

DECLARE @LocationNameColumn NVARCHAR(MAX) = '';
SET @LocationNameColumn =
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @list_table
              AND COLUMN_NAME = 'Location Name'
        )
          THEN 'lt.[Location Name] as locationName, lt.[Location Name] as [Location Name], '
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @list_table
              AND COLUMN_NAME = 'Investment Name'
        )
          THEN 'lt.[Investment Name] as locationName, lt.[Investment Name] as [Location Name], '
        ELSE ''
    END;

-- Build dynamic SQL for date-filtered or all-time aggregations
-- Always build the aggregation CTE to parse JSON values
SELECT @unionClauses = STRING_AGG(CAST(
    CONCAT(
        'SELECT t.location_id, ''',
        FieldName,
        ''' AS FieldName, a.[value]
         FROM [Analyses-Dashboard] t
         CROSS APPLY OPENJSON(t.',
         QUOTENAME(FieldName),
         ') AS a
         WHERE t.list_id = @listId
           AND t.location_id > 0
           AND (@startDate IS NULL OR @endDate IS NULL OR TRY_CAST(a.[key] AS DATE) BETWEEN @startDate AND @endDate)'
    ) AS NVARCHAR(MAX)),
    '
    UNION ALL
    '
)
FROM @DateBasedFields;

-- Create CTE for aggregating JSON values
SET @dateFilteredAlertsSQL = N'
;WITH UnpivotedData AS (
    ' + @unionClauses + N'
),
AggregatedAlerts AS (
    SELECT
        location_id,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_all_nominal'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_all_nominal,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_all_high'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_all_high,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_all_highest'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_all_highest,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_sbtn_nominal'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_sbtn_nominal,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_sbtn_high'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_sbtn_high,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_sbtn_highest'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_sbtn_highest,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_jrc_nominal'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_jrc_nominal,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_jrc_high'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_jrc_high,
        ISNULL(SUM(CASE WHEN FieldName = ''integrated_alerts_daily_jrc_highest'' THEN CAST([value] AS FLOAT) END), 0) AS integrated_alerts_daily_jrc_highest,
        ISNULL(SUM(CASE WHEN FieldName IN (''intdist_alerts_area_sbtn_natural_forests_nominal'', ''intdist_alerts_area_sbtn_natural_ecosystem_nominal'') THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_sbtn_natural_nominal,
        ISNULL(SUM(CASE WHEN FieldName IN (''intdist_alerts_area_sbtn_natural_forests_high'', ''intdist_alerts_area_sbtn_natural_ecosystem_high'') THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_sbtn_natural_high,
        ISNULL(SUM(CASE WHEN FieldName IN (''intdist_alerts_area_sbtn_natural_forests_highest'', ''intdist_alerts_area_sbtn_natural_ecosystem_highest'') THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_sbtn_natural_highest,
        ISNULL(SUM(CASE WHEN FieldName = ''intdist_alerts_area_jrc_nominal'' THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_jrc_nominal,
        ISNULL(SUM(CASE WHEN FieldName = ''intdist_alerts_area_jrc_high'' THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_jrc_high,
        ISNULL(SUM(CASE WHEN FieldName = ''intdist_alerts_area_jrc_highest'' THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_jrc_highest,
        ISNULL(SUM(CASE WHEN FieldName = ''intdist_alerts_area_all_nominal'' THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_all_nominal,
        ISNULL(SUM(CASE WHEN FieldName = ''intdist_alerts_area_all_high'' THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_all_high,
        ISNULL(SUM(CASE WHEN FieldName = ''intdist_alerts_area_all_highest'' THEN CAST([value] AS FLOAT) END), 0) AS intdist_alerts_area_all_highest
    FROM UnpivotedData
    GROUP BY location_id
)';

SET @SQL = @dateFilteredAlertsSQL + N'
SELECT
    @listId AS listId,
    @listName AS listName,
    ISNULL(alerts.location_id, 0) AS locationId,
    ISNULL(alerts.gadm_id, 0) AS gadmId,
    ISNULL(alerts.viirs_alerts_daily, 0) AS viirsAlertsDaily,
    ISNULL(alerts.tree_cover_extent_total, 0) AS treeCoverExtentTotal,
    ISNULL(alerts.integrated_alerts_coverage, 0) AS integratedAlertsCoverage,
    ISNULL(alerts.total_ha, 0) AS totalHa,
    ISNULL(agg.integrated_alerts_daily_all_nominal, 0) AS integratedAlertsDailyAllNominal,
    ISNULL(agg.integrated_alerts_daily_all_high, 0) AS integratedAlertsDailyAllHigh,
    ISNULL(agg.integrated_alerts_daily_all_highest, 0) AS integratedAlertsDailyAllHighest,
    ISNULL(agg.integrated_alerts_daily_sbtn_nominal, 0) AS integratedAlertsDailySbtnNominal,
    ISNULL(agg.integrated_alerts_daily_sbtn_high, 0) AS integratedAlertsDailySbtnHigh,
    ISNULL(agg.integrated_alerts_daily_sbtn_highest, 0) AS integratedAlertsDailySbtnHighest,
    ISNULL(agg.integrated_alerts_daily_jrc_nominal, 0) AS integratedAlertsDailyJrcNominal,
    ISNULL(agg.integrated_alerts_daily_jrc_high, 0) AS integratedAlertsDailyJrcHigh,
    ISNULL(agg.integrated_alerts_daily_jrc_highest, 0) AS integratedAlertsDailyJrcHighest,
    alerts.status_code AS location_status_id,
    alerts.location_error AS analysisError,
    ISNULL(agg.intdist_alerts_area_sbtn_natural_nominal, 0) AS distAlertsAreaSbtnNaturalNominal,
    ISNULL(agg.intdist_alerts_area_sbtn_natural_high, 0) AS distAlertsAreaSbtnNaturalHigh,
    ISNULL(agg.intdist_alerts_area_sbtn_natural_highest, 0) AS distAlertsAreaSbtnNaturalHighest,
    ISNULL(agg.intdist_alerts_area_jrc_nominal, 0) AS distAlertsAreaJrcNominal,
    ISNULL(agg.intdist_alerts_area_jrc_high, 0) AS distAlertsAreaJrcHigh,
    ISNULL(agg.intdist_alerts_area_jrc_highest, 0) AS distAlertsAreaJrcHighest,
    ISNULL(agg.intdist_alerts_area_all_nominal, 0) AS distAlertsAreaAllNominal,
    ISNULL(agg.intdist_alerts_area_all_high, 0) AS distAlertsAreaAllHigh,
    ISNULL(agg.intdist_alerts_area_all_highest, 0) AS distAlertsAreaAllHighest,

    ' + @LocationNameColumn + N'
    lt.Country as country,
    lt.State as state,
    lt.[Sub State] as subState,
    lt.ErrorDetails as errorDetails,
    lt.attributes as attributes,
    ' + CAST(@listVersion AS NVARCHAR(10)) + N' AS version,

    ' + @locationColumns + 
    CASE WHEN @jsonAttributeColumns IS NOT NULL AND LEN(@jsonAttributeColumns) > 0
         THEN @jsonAttributeColumns + N','
         ELSE N''
    END + N'

    COUNT(*) OVER () AS totalRows

FROM [Analyses-Dashboard] alerts
LEFT JOIN AggregatedAlerts agg ON agg.location_id = alerts.location_id
JOIN dbo.[' + @list_table + N'] lt ON lt.location_id = alerts.location_id
WHERE alerts.location_id > 0
  AND alerts.list_id = @listId
';

IF @Country IS NOT NULL
    SET @Filters += ' AND lt.Country = @Country';

IF @State IS NOT NULL
    SET @Filters += ' AND lt.State = @State';

IF @SubState IS NOT NULL
    SET @Filters += ' AND lt.[Sub State] = @SubState';

IF @hasError IS NOT NULL
    SET @Filters += ' AND lt.ErrorDetails IS NOT NULL AND LEN(lt.ErrorDetails) > 0';

IF @selectedSupplier IS NOT NULL
    SET @Filters += ' AND lt.[Supplier Name] = @selectedSupplier';

IF @selectedSecondSupplier IS NOT NULL
    SET @Filters += ' AND lt.[Second Supplier Name] = @selectedSecondSupplier';

IF @selectedParentCompany IS NOT NULL
    SET @Filters += ' AND lt.[Parent Company] = @selectedParentCompany';

IF @showRSPOCertified = 1
    SET @Filters += ' AND lt.[RSPO Model] = 1';

IF (@SearchString IS NOT NULL)
    SET @SQL += ' AND (
                      lt.Country LIKE @SearchString
                      OR lt.State LIKE @SearchString
                      OR lt.[Location Name] LIKE @SearchString
                  )';

IF (@Filters IS NOT NULL)
    SET @SQL += @Filters;

DECLARE @isValidSortColumn BIT = 0;

IF CHARINDEX(@sortByAttribute, @alertsColumns) > 0
   OR CHARINDEX(@sortByAttribute, @ltColumns) > 0
   OR CHARINDEX(@sortByAttribute, @calculatedColumns) > 0
   OR (@jsonAttributeColumns IS NOT NULL AND CHARINDEX('AS [' + @sortByAttribute + ']', @jsonAttributeColumns) > 0)
BEGIN
    SET @isValidSortColumn = 1;
END;

IF @orderType IS NOT NULL
   AND @sortByAttribute IS NOT NULL
   AND @isValidSortColumn = 1
BEGIN
    SET @SQL += ' ORDER BY ' +
            CASE
                WHEN ',' + @alertsColumns + ',' LIKE '%,' + @sortByAttribute + ',%'
                     THEN 'alerts.' + QUOTENAME(@sortByAttribute)
                WHEN ',' + @ltColumns + ',' LIKE '%,' + @sortByAttribute + ',%'
                     THEN 'lt.' + QUOTENAME(@sortByAttribute)
                WHEN ',' + @calculatedColumns + ',' LIKE '%,' + @sortByAttribute + ',%'
                     THEN QUOTENAME(@sortByAttribute)
                WHEN @jsonAttributeColumns IS NOT NULL 
                     AND CHARINDEX('AS [' + @sortByAttribute + ']', @jsonAttributeColumns) > 0
                     THEN CASE
                          WHEN (
                              SELECT attribute_type
                              FROM ListAttributes
                              WHERE list_id = @listId
                              AND attribute_name = @sortByAttribute
                          ) = 1
                          THEN 'CAST(JSON_VALUE(lt.attributes, ''$."' + @sortByAttribute + '"'') AS DECIMAL(18,6))'
                          ELSE 'CAST(JSON_VALUE(lt.attributes, ''$."' + @sortByAttribute + '"'') AS NVARCHAR(MAX))'
                     END
                ELSE QUOTENAME(@sortByAttribute)
            END
            + ' ' + @orderType;
END
ELSE
BEGIN
    SET @SQL += ' ORDER BY alerts.integrated_alerts_daily_all_highest DESC';
END;

IF @RowsOfPage > 0 AND @PageNumber > 0
    SET @SQL += ' OFFSET (@PageNumber - 1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY';

EXEC sp_executesql @SQL,
N'@listId INT,
  @listName NVARCHAR(150),
  @rowsOfPage INT,
  @pageNumber INT,
  @Country NVARCHAR(255),
  @State NVARCHAR(255),
  @SubState NVARCHAR(255),
  @hasError BIT,
  @selectedSupplier NVARCHAR(255),
  @selectedSecondSupplier NVARCHAR(255),
  @selectedParentCompany NVARCHAR(255),
  @showRSPOCertified BIT,
  @SearchString NVARCHAR(255),
  @orderType NVARCHAR(255),
  @sortByAttribute NVARCHAR(255),
  @jsonAttributeColumns NVARCHAR(MAX),
  @startDate DATE,
  @endDate DATE',
@listId               = @listId,
@listName             = @listName,
@rowsOfPage           = @rowsOfPage,
@pageNumber           = @pageNumber,
@Country              = @Country,
@State                = @State,
@SubState             = @SubState,
@hasError             = @hasError,
@selectedSupplier     = @selectedSupplier,
@selectedSecondSupplier = @selectedSecondSupplier,
@selectedParentCompany  = @selectedParentCompany,
@showRSPOCertified    = @showRSPOCertified,
@SearchString         = @SearchString,
@orderType            = @orderType,
@sortByAttribute      = @sortByAttribute,
@jsonAttributeColumns = @jsonAttributeColumns,
@startDate            = @startDate,
@endDate              = @endDate;`;

export class PaginatedAlertsAnalysisByListIdSortedByFilters {
  listId: number;
  listName: string;
  locationId: number;
  gadmId: number;
  viirsAlertsDaily: number;
  treeCoverExtentTotal: number;
  integratedAlertsCoverage: number;
  totalHa: number;
  integratedAlertsDailyAllNominal: number;
  integratedAlertsDailyAllHigh: number;
  integratedAlertsDailyAllHighest: number;
  integratedAlertsDailySbtnNominal: number;
  integratedAlertsDailySbtnHigh: number;
  integratedAlertsDailySbtnHighest: number;
  integratedAlertsDailyJrcNominal: number;
  integratedAlertsDailyJrcHigh: number;
  integratedAlertsDailyJrcHighest: number;
  location_status_id: number;
  analysisError: number | null;
  distAlertsAreaSbtnNaturalNominal: number;
  distAlertsAreaSbtnNaturalHigh: number;
  distAlertsAreaSbtnNaturalHighest: number;
  distAlertsAreaJrcNominal: number;
  distAlertsAreaJrcHigh: number;
  distAlertsAreaJrcHighest: number;
  distAlertsAreaAllNominal: number;
  distAlertsAreaAllHigh: number;
  distAlertsAreaAllHighest: number;
  locationName: string;
  country: string;
  state: string;
  subState: string;
  totalRows: number;
  errorDetails: string;
  attributes: string;
  version: number;
}
