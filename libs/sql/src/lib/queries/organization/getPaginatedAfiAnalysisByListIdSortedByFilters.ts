/**
 * This query to get paginated AFI Analysis for a list by location
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedAfiAnalysisByListIdSortedByFilters = `
DECLARE @list_table NVARCHAR(150);
DECLARE @listName  NVARCHAR(150);
DECLARE @listVersion INT;
DECLARE @SQL NVARCHAR(MAX);
DECLARE @Filters NVARCHAR(MAX) = '';
DECLARE @AnalysisFilters NVARCHAR(MAX) = '1=1';
DECLARE @where_clauses NVARCHAR(max) = '';
DECLARE @listLocationTableCols NVARCHAR(MAX);
DECLARE @listLocationTableName NVARCHAR(1000);

SELECT
    @list_table = [list_table_name],
    @listName   = [list_Name],
    @listVersion= [version]
FROM [Lists]
WHERE id = @listId;

DECLARE @ValidSortColumns TABLE (
    ColumnName NVARCHAR(255) NOT NULL,
    Source NVARCHAR(25) NOT NULL,
    IsNumeric BIT NOT NULL DEFAULT 0
);

INSERT INTO @ValidSortColumns (ColumnName, Source) VALUES
    ('location_id', 'afi'),
    ('gadm_id', 'afi'),
    ('natural_land_area', 'afi'),
    ('natural_land_deforested_area', 'afi'),
    ('total_area_ha', 'afi'),
    ('status_code', 'afi'),
    ('location_error', 'afi'),
    ('negligible_risk', 'afi'),
    ('jrc_land_area', 'afi'),
    ('jrc_land_deforested_area', 'afi'),
    ('jrc_forest_loss_by_year', 'afi'),
    ('natural_forest_loss_by_year', 'afi'),
    ('protected_areas_area', 'afi'),
    ('landmark_area', 'afi');

INSERT INTO @ValidSortColumns (ColumnName, Source) VALUES
    ('Country', 'lt'),
    ('State', 'lt'),
    ('Sub State', 'lt');

INSERT INTO @ValidSortColumns (ColumnName, Source, IsNumeric) VALUES
    ('protectedAreasPercent', 'computed', 1),
    ('landmarkPercent', 'computed', 1),
    ('naturalForestLossPercent', 'computed', 1),
    ('jrcNaturalForestLossPercent', 'computed', 1);

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

DECLARE @locationColumns NVARCHAR(MAX) = '';

SELECT @locationColumns +=
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @list_table
              AND COLUMN_NAME = oc.ColumnName
        )
            THEN ' lt.' + QUOTENAME(oc.ColumnName) + ' AS ' + QUOTENAME(oc.ColumnName) + ', '
        ELSE ''
    END
FROM @OptionalColumns oc;

DECLARE @LocationNameColumn NVARCHAR(MAX) = '';
DECLARE @LocationNameDbColumn NVARCHAR(255) = NULL;

SET @LocationNameColumn =
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @list_table
              AND COLUMN_NAME = 'Location Name'
        )
        BEGIN
            SET @LocationNameDbColumn = '[Location Name]';
            INSERT INTO @ValidSortColumns (ColumnName, Source) VALUES ('Location Name', 'ltLocationName'), ('locationName', 'ltLocationName');
            SELECT 'lt.[Location Name] as locationName, lt.[Location Name] as [Location Name], '
        END
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @list_table
              AND COLUMN_NAME = 'Investment Name'
        )
        BEGIN
            SET @LocationNameDbColumn = '[Investment Name]';
            INSERT INTO @ValidSortColumns (ColumnName, Source) VALUES ('Investment Name', 'ltLocationName'), ('locationName', 'ltLocationName');
            SELECT 'lt.[Investment Name] as locationName, lt.[Investment Name] as [Location Name], '
        END
        ELSE ''
    END;

DECLARE @JsonAttributeColumns NVARCHAR(MAX) = '';
DECLARE @JsonAttributes TABLE (
    attribute_name NVARCHAR(255),
    attribute_type INT
);

INSERT INTO @JsonAttributes (attribute_name, attribute_type)
SELECT attribute_name, attribute_type
FROM ListAttributes
WHERE list_id = @listId;

SELECT @JsonAttributeColumns +=
    ' JSON_VALUE(lt.attributes, ''$."' + REPLACE(ja.attribute_name, '''', '''''') + '"'' ) AS [' + ja.attribute_name + '],'
FROM @JsonAttributes ja;

INSERT INTO @ValidSortColumns (ColumnName, Source, IsNumeric)
SELECT ja.attribute_name,
       'json',
       CASE WHEN ja.attribute_type = 1 THEN 1 ELSE 0 END
FROM @JsonAttributes ja;

SET @SQL = N'
SELECT
    @listId AS listId,
    @listName AS listName,
    ISNULL(afi.location_id, 0) AS locationId,
    ISNULL(afi.gadm_id, 0) AS gadmId,
    ISNULL(afi.natural_land_area, 0) AS coverageHA,
    ISNULL(afi.natural_land_deforested_area, 0) AS naturalForestLossHA,
    ISNULL(afi.total_area_ha, 0) AS totalAreaHa,
    afi.status_code AS location_status_id,
    afi.location_error AS analysisError,
    ISNULL(afi.negligible_risk, 0) AS negligibleRisk,
    ISNULL(afi.jrc_land_area, 0) AS jrcLandAreaHA,
    ISNULL(afi.jrc_land_deforested_area, 0) AS jrcNaturalForestLossHA,
    ISNULL(afi.jrc_forest_loss_by_year, 0) AS jrcForestLossByYear,
    ISNULL(afi.natural_forest_loss_by_year, 0) AS naturalForestLossByYear,
    ISNULL(afi.protected_areas_area, 0) AS protectedAreasHA,
    ISNULL(afi.landmark_area, 0) AS landmarkHA,

    ' + @LocationNameColumn + N'
    lt.Country as country,
    lt.State as state,
    lt.[Sub State] as subState,
    lt.ErrorDetails as errorDetails,
    lt.attributes as attributes,
    ' + CAST(@listVersion AS NVARCHAR(10)) + N' AS version,

    ' + @locationColumns + N'

    CASE WHEN ISNULL(afi.total_area_ha, 0) = 0 THEN 0
         ELSE (afi.protected_areas_area * 100.0 / afi.total_area_ha)
    END AS protectedAreasPercent,

    CASE WHEN ISNULL(afi.total_area_ha, 0) = 0 THEN 0
         ELSE (afi.landmark_area * 100.0 / afi.total_area_ha)
    END AS landmarkPercent,

    CASE WHEN ISNULL(afi.total_area_ha, 0) = 0 THEN 0
         ELSE (afi.natural_land_deforested_area * 100.0 / afi.total_area_ha)
    END AS naturalForestLossPercent,

    CASE WHEN ISNULL(afi.total_area_ha, 0) = 0 THEN 0
         ELSE (afi.jrc_land_deforested_area * 100.0 / afi.total_area_ha)
    END AS jrcNaturalForestLossPercent,

    ' +
    CASE
        WHEN @JsonAttributeColumns IS NOT NULL AND LEN(@JsonAttributeColumns) > 0
            THEN @JsonAttributeColumns
        ELSE ''
    END + N'
    COUNT(*) OVER () AS totalRows

FROM AFIAnalysis afi
JOIN dbo.' + QUOTENAME(@list_table) + N' lt ON lt.location_id = afi.location_id
WHERE afi.location_id > 0
  AND afi.list_id = @listId
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

DECLARE @orderDirection NVARCHAR(4) = NULL;

IF @orderType IS NOT NULL
BEGIN
    SET @orderDirection =
        CASE WHEN UPPER(@orderType) = 'DESC' THEN 'DESC'
             WHEN UPPER(@orderType) = 'ASC'  THEN 'ASC'
        END;
END;

DECLARE @sortSource NVARCHAR(25) = NULL;
DECLARE @sortIsNumeric BIT = 0;
DECLARE @quotedSortByAttribute NVARCHAR(260) = NULL;
DECLARE @sortByAttributeForJson NVARCHAR(255) = NULL;

IF @sortByAttribute IS NOT NULL
BEGIN
    SELECT TOP (1)
        @sortSource = Source,
        @sortIsNumeric = IsNumeric
    FROM @ValidSortColumns
    WHERE ColumnName = @sortByAttribute;

    IF @sortSource IS NOT NULL
    BEGIN
        SET @quotedSortByAttribute = QUOTENAME(@sortByAttribute);
        SET @sortByAttributeForJson = REPLACE(@sortByAttribute, '''', '''''');
    END;
END;

IF @orderDirection IS NOT NULL
   AND @sortSource IS NOT NULL
BEGIN
    SET @SQL += ' ORDER BY ' +
        CASE @sortSource
            WHEN 'afi' THEN 'afi.' + @quotedSortByAttribute
            WHEN 'lt' THEN 'lt.' + @quotedSortByAttribute
            WHEN 'ltLocationName' THEN
                CASE
                    WHEN @LocationNameDbColumn IS NOT NULL THEN 'lt.' + @LocationNameDbColumn
                    ELSE 'lt.[Location Name]'
                END
            WHEN 'computed' THEN @quotedSortByAttribute
            WHEN 'json' THEN
                CASE WHEN @sortIsNumeric = 1
                     THEN 'TRY_CAST(JSON_VALUE(lt.attributes, ''$."' + @sortByAttributeForJson + '"'' ) AS DECIMAL(18,6))'
                     ELSE 'JSON_VALUE(lt.attributes, ''$."' + @sortByAttributeForJson + '"'' )'
                END
        END + ' ' + @orderDirection;
END
ELSE
BEGIN
    SET @SQL += ' ORDER BY afi.negligible_risk ASC, afi.natural_land_deforested_area DESC';
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
  @sortByAttribute NVARCHAR(255)',
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
@sortByAttribute      = @sortByAttribute;`;

export class PaginatedAfiAnalysisByListIdSortedByFilters {
  listId: number;
  listName: string;
  locationId: number;
  gadmId: number;
  coverageHA: number;
  naturalForestLossHA: number;
  totalAreaHa: number;
  location_status_id: number;
  analysisError: number;
  negligibleRisk: number;
  jrcLandAreaHA: number;
  jrcNaturalForestLossHA: number;
  jrcForestLossByYear: number;
  naturalForestLossByYear: number;
  protectedAreasHA: number;
  landmarkHA: number;
  locationName: string;
  country: string;
  state: string;
  subState: string;
  totalRows: number;
  errorDetails: string;
  attributes: string;
  version: number;
}