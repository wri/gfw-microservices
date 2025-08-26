/**
 * This query to get paginated GHG Analysis for a list by location
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedGHGAnalysisLocationLevel = `
DECLARE @list_table NVARCHAR(150)
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @locationColumn NVARCHAR(100)

SELECT @list_table = list_table_name , @listName = list_Name FROM [Lists] WHERE id = @listId

SET @SQL = 'SELECT  ' +
' @listId as listId,' +
' @listName as listName,' +
' lt.Country as country, ' +
' lt.State as state, ' +
' lt.[Sub State] as subState, ' +
' ghg.location_id as locationId, ' +
' ghg.total_area_ha as totalAreaHa, ' +
' ghg.status_code as statusCode, ' +
' ghg.location_error as locationError, ' +
' ghg.emissions_factor_by_year as emissionsFactorByYear, ' +
' ghg.ef_co2_by_year as efCo2ByYear, ' +
' ghg.ef_ch4_by_year as efCh4ByYear, ' +
' ghg.emissions_co2_yearly as emissionsCo2Yearly, '+
' ghg.emissions_ch4_yearly as emissionsCh4Yearly, '+
' ghg.emissions_n2o_yearly as emissionsN2oYearly, '+
' ghg.emissions_yearly as emissionsYearly, '+
' ghg.production as production, '+
' ghg.weighted_avg_yield as weightedAvgYield, '+
' lt.[Location Name] as locationName,  '+ 
' ghg.ef_n2o_by_year as efN2oByYear ' +


'FROM GHGAnalyses ghg JOIN dbo.[' + @list_table + '] lt ON lt.location_id = ghg.location_id ' +
'WHERE ghg.location_id > 0 AND ghg.list_id = @listId'


SET @SQL = @SQL + ' ORDER BY ghg.location_id ASC ' +
                'OFFSET (@pageNumber) * @rowsOfPage ROWS FETCH NEXT @rowsOfPage ROWS ONLY';

EXEC sp_executesql @SQL,
     N'@listId INT, @listName NVARCHAR(150), @rowsOfPage INT, @pageNumber INT',
     @listId = @listId, @listName = @listName, @rowsOfPage = @rowsOfPage, @pageNumber = @pageNumber;
`;

export class GHGAnalysisDataByListId {
  listId: number;
  listName: string;
  locationName: string;
  country: string;
  state: string;
  subState: string;
  totalAreaHa: number;
  statusCode: number;
  locationError: string;
  emissionsFactorByYear: string;
  efCo2ByYear: string;
  efCh4ByYear: string;
  efN2oByYear: string;
  emissionsCo2Yearly: string;
  emissionsCh4Yearly: string;
  emissionsN2oYearly: string;
  emissionsYearly: string;
  production: number;
  weightedAvgYield: number;
}
