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
DECLARE @orderType NVARCHAR(100)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @sortByAttribute NVARCHAR(MAX)
DECLARE @SubState NVARCHAR(MAX)
DECLARE @State NVARCHAR(MAX)
DECLARE @Country NVARCHAR(MAX)

SELECT @list_table = list_table_name, @listName=list_Name FROM [Lists] WHERE id = @listId

SET @SQL = 'SELECT  ' +
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
            ' lt.[Location Name] as locationName, ' +
            ' lt.Country as country ,' +
            ' lt.State as state,' +
            ' lt.[Sub State] as subState ' +
            'FROM AFIAnalysis afi JOIN dbo.['+@list_table+'] lt ON lt.location_id = afi.location_id WHERE afi.location_id > 0 AND afi.list_id = @listId';


-- ADD Filters
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
		--PRINT @SearchLogic;
		SET @Filters = CONCAT(@Filters,' AND ', @SearchLogic);
	END


	-- END Filters

PRINT @Filters
PRINT @SQL
if (@orderType IS NOT NULL AND @sortByAttribute IS NOT NULL)
  SET @SQL = @SQL + ' ORDER BY '+@sortByAttribute+' '+@orderType;
else
  SET @SQL = @SQL +' '+ ' ORDER BY afi.negligible_risk ASC, afi.natural_land_deforested_area DESC';


IF @RowsOfPage > 0 AND @PageNumber > 0
    SET @SQL = @SQL +' OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY';

EXEC sp_executesql @SQL,
     N'@listId INT, @listName NVARCHAR(150), @rowsOfPage INT, @pageNumber INT',
     @listId=@listId, @listName=@listName,@rowsOfPage=@rowsOfPage, @pageNumber=@pageNumber;
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
}
