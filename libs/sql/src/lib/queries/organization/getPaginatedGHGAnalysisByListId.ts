/**
 * This query to get paginated GHG Analysis for a list.
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedGHGAnalysisListLevel = `
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)

SELECT  @listName=list_Name   FROM [Lists] WHERE id = @listId

SET @SQL = ' SELECT ghg.list_id as listId, '+
    ' @listName as listName, ' +
    ' ghg.location_id as locationId, '+
    ' ghg.total_area_ha AS totalAreaHa, '+
    ' ghg.status_code as statusCode, '+
    ' ghg.location_error as locationError, '+
    ' ghg.emissions_factor_by_year AS emissionsFactorByYear ' +
    ' FROM [dbo].[GHGAnalyses] ghg WHERE ghg.list_id = @listId ';

SET @SQL = @SQL + ' ORDER BY ghg.location_id ' +
                'OFFSET (@pageNumber) * @rowsOfPage ROWS FETCH NEXT @rowsOfPage ROWS ONLY';

EXEC sp_executesql @SQL,
     N'@listId INT, @listName NVARCHAR(150), @rowsOfPage INT, @pageNumber INT',
     @listId = @listId, @listName = @listName, @rowsOfPage = @rowsOfPage, @pageNumber = @pageNumber;
`;


export class GHGAnalysisByListId {
  listId: number;
  locationId: number;
  totalAreaHA: number;
  statusCode: number;
  listName: string;
  locationError?: string;
  emissionsFactorByYear: string;
}
