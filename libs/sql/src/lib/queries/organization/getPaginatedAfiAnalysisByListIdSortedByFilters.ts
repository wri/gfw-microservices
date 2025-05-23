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

DECLARE @afiColumns NVARCHAR(MAX) = 'location_id, gadm_id, natural_land_area, natural_land_deforested_area, total_area_ha, status_code, location_error, negligible_risk, jrc_land_area, jrc_land_deforested_area, jrc_forest_loss_by_year, natural_forest_loss_by_year, protected_areas_area, landmark_area';
DECLARE @ltColumns NVARCHAR(MAX) = '[Location Name], Country, State, [Sub State]';
DECLARE @calculatedColumns NVARCHAR(MAX) = 'protectedAreasPercent, landmarkPercent, naturalForestLossPercent, jrcNaturalForestLossPercent';

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

SET @SQL = N'
SELECT
    @listId AS listId,
    @listName AS listName,
    ISNULL(afi.location_id, 0) AS locationId,
    ISNULL(afi.gadm_id, 0) AS gadmId,
    ISNULL(afi.natural_land_area, 0) AS coverageHA,
    ISNULL(afi.natural_land_deforested_area, 0) AS naturalForestLossHA,
    ISNULL(afi.total_area_ha, 0) AS totalAreaHa,
    afi.status_code AS analysisStatusId,
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
    N' ' + CASE WHEN @JsonAttributeColumns IS NOT NULL AND LEN(@JsonAttributeColumns) > 0
                THEN @JsonAttributeColumns + ','
                ELSE ''
           END + N'

    COUNT(*) OVER () AS totalRows

FROM AFIAnalysis afi
JOIN dbo.[' + @list_table + N'] lt ON lt.location_id = afi.location_id
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

DECLARE @isValidSortColumn BIT = 0;

-- Check if sortByAttribute exists in regular columns
IF CHARINDEX(@sortByAttribute, @afiColumns) > 0
   OR CHARINDEX(@sortByAttribute, @ltColumns) > 0
   OR CHARINDEX(@sortByAttribute, @calculatedColumns) > 0
BEGIN
    SET @isValidSortColumn = 1;
END;

-- Check if sortByAttribute is in JsonAttributeColumns
IF @JsonAttributeColumns IS NOT NULL AND LEN(@JsonAttributeColumns) > 0
BEGIN
    -- Extract attribute names from JsonAttributeColumns
    DECLARE @jsonAttributeNames TABLE (AttributeName NVARCHAR(255));

    -- Parse the JsonAttributeColumns string to get attribute names
    -- Format is typically: CAST(JSON_VALUE(lt.attributes, '$."attr1"') AS type) AS [attr1], ...
    DECLARE @tempJsonColumns NVARCHAR(MAX) = @JsonAttributeColumns;
    DECLARE @startPos INT, @endPos INT;

    WHILE LEN(@tempJsonColumns) > 0
    BEGIN
        SET @startPos = CHARINDEX('AS [', @tempJsonColumns);
        IF @startPos > 0
        BEGIN
            SET @startPos = @startPos + 4;
            SET @endPos = CHARINDEX(']', @tempJsonColumns, @startPos);
            IF @endPos > 0
            BEGIN
                INSERT INTO @jsonAttributeNames
                SELECT SUBSTRING(@tempJsonColumns, @startPos, @endPos - @startPos);
                SET @tempJsonColumns = SUBSTRING(@tempJsonColumns, @endPos + 1, LEN(@tempJsonColumns));
            END
            ELSE
                BREAK;
        END
        ELSE
            BREAK;
    END

    -- Check if sortByAttribute is in the JSON attributes
    IF EXISTS (SELECT 1 FROM @jsonAttributeNames WHERE AttributeName = @sortByAttribute)
    BEGIN
        SET @isValidSortColumn = 1;
    END
END;

IF @orderType IS NOT NULL
   AND @sortByAttribute IS NOT NULL
   AND @isValidSortColumn = 1
BEGIN
    -- Validate and sanitize the attribute name
    DECLARE @jsonPath NVARCHAR(MAX) = '$."' + REPLACE(REPLACE(@sortByAttribute, '"', ''), '''', '') + '"';

    -- Verify the attribute name is valid
    IF @jsonPath NOT LIKE '$."%"' OR LEN(@jsonPath) < 4
    BEGIN
        SET @jsonPath = '$."invalid_attribute"';
    END

    SET @SQL += ' ORDER BY ' +
            CASE
                WHEN CHARINDEX(@sortByAttribute, @afiColumns) > 0
                     THEN 'afi.' + QUOTENAME(@sortByAttribute)
                WHEN CHARINDEX(@sortByAttribute, @ltColumns) > 0
                     THEN 'lt.' + QUOTENAME(@sortByAttribute)
                WHEN EXISTS (SELECT 1 FROM @jsonAttributeNames WHERE AttributeName = @sortByAttribute)
                     THEN 'CASE
                            WHEN ISJSON(lt.attributes) = 1 AND JSON_VALUE(lt.attributes, ''' + @jsonPath + ''') IS NOT NULL
                            THEN CASE
                                   WHEN ISNUMERIC(JSON_VALUE(lt.attributes, ''' + @jsonPath + ''')) = 1 THEN 0
                                   ELSE 1
                                 END
                            ELSE 2
                          END,
                          CASE
                            WHEN ISNUMERIC(JSON_VALUE(lt.attributes, ''' + @jsonPath + ''')) = 1
                            THEN CAST(JSON_VALUE(lt.attributes, ''' + @jsonPath + ''') AS DECIMAL(18,2))
                            ELSE NULL
                          END,
                          CASE
                            WHEN ISNUMERIC(JSON_VALUE(lt.attributes, ''' + @jsonPath + ''')) = 0
                            THEN JSON_VALUE(lt.attributes, ''' + @jsonPath + ''')
                            ELSE NULL
                          END'
                ELSE QUOTENAME(@sortByAttribute)
            END
            + ' ' + @orderType;
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
  @sortByAttribute NVARCHAR(255),
  @JsonAttributeColumns NVARCHAR(MAX)',
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
@JsonAttributeColumns = @JsonAttributeColumns;`;

export class PaginatedAfiAnalysisByListIdSortedByFilters {
  listId: number;
  listName: string;
  locationId: number;
  gadmId: number;
  coverageHA: number;
  naturalForestLossHA: number;
  totalAreaHa: number;
  analysisStatusId: number;
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
