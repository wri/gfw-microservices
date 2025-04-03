/**
 * This query to get paginated AFI Analysis for a list.
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedAfiAnalysisListLevel = `
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)

SELECT  @listName=list_Name   FROM [Lists] WHERE id = @listId

SET @SQL = ' SELECT afi.list_id as listId, '+
    ' @listName as listName, ' +
    ' afi.location_id as locationId, '+
    ' afi.gadm_id AS gadmId, '+
    ' afi.natural_land_area AS coverageHA, '+
    ' afi.natural_land_deforested_area AS naturalForestLossHA, '+
    ' afi.total_area_ha AS totalAreaHa, '+
    ' afi.status_code as statusCode, '+
    ' afi.location_error as locationError, '+
    ' afi.negligible_risk AS negligibleRisk,  '+
    ' afi.jrc_land_area AS jrcLandAreaHA ,'+
    ' afi.jrc_land_deforested_area AS jrcLandDeforestedAreaHA ,'+
    ' afi.jrc_forest_loss_by_year AS jrcForestLossByYear ,'+
    ' afi.natural_forest_loss_by_year AS naturalForestLossByYear ,'+
    ' afi.protected_areas_area AS protectedAreasArea ,'+
    ' afi.landmark_area AS landmarkArea ,' +
    ' AA.[Country] as country,  '+
    ' AA.[State] as state,  '+
    ' AA.[Sub State] as subState  '+
    ' FROM [AFIAnalysis] afi  '+
    ' LEFT JOIN gfwpro.dbo.[list-administrativeAreas] AA ON AA.gadmid = afi.gadm_id  '+
    ' WHERE afi.list_id = @listId ';

SET @SQL = @SQL + ' AND  afi.location_id < 0  AND afi.gadm_id IS NOT NULL';

SET @SQL = @SQL + ' ORDER BY afi.negligible_risk ASC, afi.natural_land_deforested_area DESC OFFSET (@pageNumber)*@rowsOfPage ROWS FETCH NEXT @rowsOfPage ROWS ONLY';

PRINT @SQL
EXEC sp_executesql @SQL,
    N'@listId INT, @rowsOfPage INT, @pageNumber INT, @listName VARCHAR(150)',
    @listId=@listId,@rowsOfPage=@rowsOfPage, @pageNumber=@pageNumber,  @listName=@listName;
`;

/**
 * This query to get paginated AFI Analysis for a list by location
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedAfiAnalysisLocationLevel = `
DECLARE @analysis_table NVARCHAR(150)
DECLARE @list_table NVARCHAR(150)
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @locationColumn NVARCHAR(100)

SELECT @list_table = list_table_name, @listName = list_Name, @analysis_table = list_analysis_table_name FROM [Lists] WHERE id = @listId

IF COL_LENGTH('dbo.' + @list_table, 'Location Name') IS NOT NULL
BEGIN
    SET @locationColumn = 'lt.[Location Name]'
END
ELSE
BEGIN
    SET @locationColumn = 'lt.[Investment Name]'
END

SET @SQL = 'SELECT  ' +
' @listId as listId,' +
' @listName as listName,' +
' afi.location_id as locationId, ' +
' afi.gadm_id AS gadmId, ' +
' afi.natural_land_area AS coverageHA, ' +
' afi.natural_land_deforested_area AS naturalForestLossHA, ' +
' anlt.total_area AS totalAreaHa, ' +  -- Adjusted for "anlt" table
' afi.status_code as statusCode, ' +
' afi.location_error as locationError, ' +
' afi.negligible_risk AS negligibleRisk, ' +
' afi.jrc_land_area AS jrcLandAreaHA, ' +
' afi.jrc_land_deforested_area AS jrcLandDeforestedAreaHA, ' +
' afi.jrc_forest_loss_by_year AS jrcForestLossByYear, ' +
' afi.natural_forest_loss_by_year AS naturalForestLossByYear, ' +
' afi.protected_areas_area AS protectedAreasArea, ' +
' afi.landmark_area AS landmarkArea, ' + 
@locationColumn + ' as locationName, ' + 
' lt.Country as country, ' +
' lt.State as state, ' +
' lt.[Sub State] as subState ' +
'FROM AFIAnalysis afi ' +
'JOIN dbo.['+@list_table+'] lt ON lt.location_id = afi.location_id ' +
'LEFT JOIN ['+@analysis_table+'] anlt ON anlt.location_id = afi.location_id ' +  -- LEFT JOIN for "anlt"
'WHERE afi.location_id > 0 AND afi.list_id = @listId';
            

SET @SQL = @SQL + ' ORDER BY afi.negligible_risk ASC, afi.natural_land_deforested_area DESC ' +
                'OFFSET (@pageNumber) * @rowsOfPage ROWS FETCH NEXT @rowsOfPage ROWS ONLY';

EXEC sp_executesql @SQL,
     N'@listId INT, @listName NVARCHAR(150), @rowsOfPage INT, @pageNumber INT',
     @listId = @listId, @listName = @listName, @rowsOfPage = @rowsOfPage, @pageNumber = @pageNumber;
`;

export class AfiAnalysisByListId {
  country: string;
  coverageHA: number;
  gadmId: string;
  jrcForestLossByYear: string;
  jrcLandAreaHA: number;
  jrcLandDeforestedArea: number;
  landmarkArea: number;
  listId: number;
  listName: string;
  locationError: string;
  locationId: number;
  locationName?: string;
  naturalForestLossByYear: string;
  naturalForestLossHA: number;
  negligibleRisk: number;
  protectedAreasArea: number;
  state: string;
  statusCode: number;
  subState: string;
  totalAreaHA: number;
}
