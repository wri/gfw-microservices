/**
 * This query to get paginated AFI Analysis for a list.
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
const getPaginatedAfiAnalysisListLevel = `
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
    ' AA.[Country] as country,  '+
    ' AA.[State] as state,  '+
    ' AA.[Sub State] as subState  '+
    ' FROM [AFIAnalysis] afi  '+
    ' LEFT JOIN gfwpro.dbo.[list-administrativeAreas] AA ON AA.gadmid = afi.gadm_id  '+
    ' WHERE afi.list_id = @listId ';

SET @SQL = @SQL + ' AND  afi.location_id < 0  AND afi.gadm_id IS NOT NULL';

IF @rowsOfPage > 0 AND @pageNumber > 0
BEGIN
    SET @SQL = @SQL + 'ORDER BY  afi.negligible_risk OFFSET (@pageNumber-1)*@rowsOfPage ROWS FETCH NEXT @rowsOfPage ROWS ONLY';
END

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
const getPaginatedAfiAnalysisLocationLevel = `
DECLARE @list_table NVARCHAR(150)
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)

SELECT @list_table = list_table_name, @listName=list_Name FROM [Lists] WHERE id = @listId

SET @SQL = 'SELECT  ' +
            ' @listId as listId,' +
            ' @listName as listName,' +
            ' afi.location_id as locationId, '+
            ' afi.gadm_id AS gadmId, '+
            ' afi.natural_land_area AS coverageHA, '+
            ' afi.natural_land_deforested_area AS naturalForestLossHA, '+
            ' afi.total_area_ha AS totalAreaHa, '+
            ' afi.negligible_risk AS negligibleRisk ,'+
            ' afi.status_code as statusCode, '+
            ' afi.location_error as locationError, '+
            ' kg.[Location Name] as locationName, ' +
            ' Kg.Country as country ,' +
            ' kg.State as state,' +
            ' kg.[Sub State] as subState ' +
            'FROM AFIAnalysis afi JOIN dbo.['+@list_table+'] kg ON kg.location_id = afi.location_id WHERE afi.location_id > 0 AND afi.list_id = @listId';


IF @rowsOfPage > 0 AND @pageNumber > 0
BEGIN
    SET @SQL = @SQL + 'ORDER BY  afi.negligible_risk OFFSET (@pageNumber-1)*@rowsOfPage ROWS FETCH NEXT @rowsOfPage ROWS ONLY';
END

EXEC sp_executesql @SQL,
     N'@listId INT, @listName NVARCHAR(150), @rowsOfPage INT, @pageNumber INT',
     @listId=@listId, @listName=@listName,@rowsOfPage=@rowsOfPage, @pageNumber=@pageNumber;
`;

class AfiAnalysisByListId {
  listId: number;
  listName: string;
  locationId: number;
  gadmId: string;
  coverageHA: number;
  naturalForestLossHA: number;
  totalAreaHa: number;
  negligibleRisk: boolean;
  statusCode: string;
  locationError: string;
  locationName?: string;
  country: string;
  state: string;
  subState: string;
}

export {
  getPaginatedAfiAnalysisListLevel,
  getPaginatedAfiAnalysisLocationLevel,
  AfiAnalysisByListId,
};
