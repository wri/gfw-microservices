/**
 * This query to get paginated AFI Analysis for a list by location
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedAfiAnalysisByListIdSortedByFilters = `
DECLARE @list_table NVARCHAR(150)
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @Filters NVARCHAR(MAX) = ''
DECLARE @AnalysisFilters NVARCHAR(MAX) = '1=1'
DECLARE @where_clauses NVARCHAR(max) = '';
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @listLocationTableName NVARCHAR(1000)

DECLARE @afiColumns NVARCHAR(MAX) = 'location_id, gadm_id, natural_land_area, natural_land_deforested_area, total_area_ha, status_code, location_error, negligible_risk, jrc_land_area, jrc_land_deforested_area, jrc_forest_loss_by_year, natural_forest_loss_by_year, protected_areas_area, landmark_area';
DECLARE @ltColumns NVARCHAR(MAX) = '[Location Name], Country, State, [Sub State]';


SELECT @list_table = list_table_name, @listName=list_Name FROM [Lists] WHERE id = @listId



DECLARE @locationColumns NVARCHAR(MAX) = '';

-- we first check if these columns exist
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

-- construct dynamically the query with the existent columns
SELECT @locationColumns +=
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = @list_table AND COLUMN_NAME = ColumnName
        )
        THEN ' lt.' + QUOTENAME(ColumnName) + ' AS ' + QUOTENAME(ColumnName) + ', '
        ELSE ''
    END
FROM @OptionalColumns;

DECLARE @LocationNameColumn NVARCHAR(MAX) = '';
SET @LocationNameColumn = CASE
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

SET @SQL = 'SELECT ' +
            ' @listId as listId,' +
            ' @listName as listName,' +
            ' ISNULL(afi.location_id, 0) as locationId, '+
            ' ISNULL(afi.gadm_id, 0) AS gadmId, '+
            ' ISNULL(afi.natural_land_area, 0) AS coverageHA, '+
            ' ISNULL(afi.natural_land_deforested_area, 0) AS naturalForestLossHA, '+
            ' ISNULL(afi.total_area_ha, 0) AS totalAreaHa, '+
            ' ISNULL(afi.status_code, 0) as statusCode, '+
            ' ISNULL(afi.location_error, 0) as locationError, '+
            ' ISNULL(afi.negligible_risk, 0) AS negligibleRisk ,'+
            ' ISNULL(afi.jrc_land_area, 0) AS jrcLandAreaHA ,'+
            ' ISNULL(afi.jrc_land_deforested_area, 0) AS jrcNaturalForestLossHA ,'+
            ' ISNULL(afi.jrc_forest_loss_by_year, 0) AS jrcForestLossByYear ,'+
            ' ISNULL(afi.natural_forest_loss_by_year, 0) AS naturalForestLossByYear ,'+
            ' ISNULL(afi.protected_areas_area, 0) AS protectedAreasHA ,'+
            ' ISNULL(afi.landmark_area, 0) AS landmarkHA ,' +

            @LocationNameColumn +

            ' lt.Country as country ,' +
            ' lt.State as state,' +
            ' lt.[Sub State] as subState, ' +

            @locationColumns +

            ' COUNT(*) OVER () AS totalRows ' +
            'FROM AFIAnalysis afi JOIN dbo.['+@list_table+'] lt ON lt.location_id = afi.location_id WHERE afi.location_id > 0 AND afi.list_id = @listId';


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

	-- END Filters

IF (@SearchString IS NOT NULL)
  SET @SQL = @SQL + ' AND lt.Country LIKE @SearchString OR lt.State LIKE @SearchString OR lt.[Location Name] LIKE @SearchString ';

if (@Filters IS NOT NULL)
  SET @SQL = @SQL + @Filters;

DECLARE @isValidSortColumn BIT = 0;

-- Check if sortByAttribute exists in afiColumns or ltColumns
IF CHARINDEX(@sortByAttribute, @afiColumns) > 0 OR CHARINDEX(@sortByAttribute, @ltColumns) > 0
    SET @isValidSortColumn = 1;

IF @orderType IS NOT NULL AND @sortByAttribute IS NOT NULL AND @isValidSortColumn = 1
    SET @SQL = @SQL + ' ORDER BY ' +
               CASE WHEN CHARINDEX(@sortByAttribute, @afiColumns) > 0
                   THEN 'afi.' + QUOTENAME(@sortByAttribute)
                   ELSE 'lt.' + QUOTENAME(@sortByAttribute)
               END + ' ' + @orderType;
ELSE
    SET @SQL = @SQL + ' ORDER BY afi.negligible_risk ASC, afi.natural_land_deforested_area DESC';


IF @RowsOfPage > 0 AND @PageNumber > 0
    SET @SQL = @SQL +' OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY';

EXEC sp_executesql @SQL,
     N'@listId INT, @listName NVARCHAR(150), @rowsOfPage INT, @pageNumber INT, @Country NVARCHAR(255), @State NVARCHAR(255), @SubState NVARCHAR(255), @selectedSupplier NVARCHAR(255), @selectedSecondSupplier NVARCHAR(255), @selectedParentCompany NVARCHAR(255), @showRSPOCertified BIT, @SearchString NVARCHAR(255), @orderType NVARCHAR(255), @sortByAttribute NVARCHAR(255)',
     @listId=@listId, @listName=@listName,@rowsOfPage=@rowsOfPage, @pageNumber=@pageNumber, @Country=@Country, @State=@State, @SubState=@SubState, @selectedSupplier=@selectedSupplier, @selectedSecondSupplier=@selectedSecondSupplier, @selectedParentCompany=@selectedParentCompany, @showRSPOCertified=@showRSPOCertified, @SearchString=@SearchString, @orderType=@orderType, @sortByAttribute=@sortByAttribute;
`;
export class PaginatedAfiAnalysisByListIdSortedByFilters {
  listId: number;
  listName: string;
  locationId: number;
  gadmId: number;
  coverageHA: number;
  naturalForestLossHA: number;
  totalAreaHa: number;
  statusCode: number;
  locationError: number;
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
}
