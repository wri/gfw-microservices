/**
 * This query to get paginated AFI Analysis for a list.
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedAfiAnalysisListLevel = `
DECLARE @listName NVARCHAR(150);

SELECT @listName = list_Name FROM [Lists] WHERE id = @listId;

SELECT
    afi.list_id as listId,
    @listName as listName,
    afi.location_id as locationId,
    afi.gadm_id AS gadmId,
    CASE WHEN afi.gadm_id LIKE '4%' THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS usesGadm4,
    ISNULL(afi.natural_land_area, 0) AS coverageHA,
    ISNULL(afi.natural_land_deforested_area, 0) AS naturalForestLossHA,
    ISNULL(afi.total_area_ha, 0) AS totalAreaHa,
    afi.status_code as location_status_id,
    afi.location_error as analysisError,
    afi.negligible_risk AS negligibleRisk,
    ISNULL(afi.jrc_land_area, 0) AS jrcLandAreaHA,
    ISNULL(afi.jrc_land_deforested_area, 0) AS jrcLandDeforestedAreaHA,
    afi.jrc_forest_loss_by_year AS jrcForestLossByYear,
    afi.natural_forest_loss_by_year AS naturalForestLossByYear,
    ISNULL(afi.protected_areas_area, 0) AS protectedAreasArea,
    ISNULL(afi.landmark_area, 0) AS landmarkArea,
    AA.[Country] as country,
    AA.[State] as state,
    AA.[Sub State] as subState
FROM [AFIAnalysis] afi
OUTER APPLY (
    SELECT TOP 1 gadmid, [Country], [State], [Sub State]
    FROM (
        SELECT gadmid, [Country], [State], [Sub State]
        FROM gfwpro.dbo.[list-administrativeAreas41]
        WHERE gadmid = afi.gadm_id AND afi.gadm_id LIKE '4%'

        UNION ALL

        SELECT gadmid, [Country], [State], [Sub State]
        FROM gfwpro.dbo.[list-administrativeAreas36]
        WHERE gadmid = afi.gadm_id AND afi.gadm_id NOT LIKE '4%'
    ) AS Combined
) AS AA
WHERE afi.list_id = @listId
  AND afi.location_id < 0
  AND afi.gadm_id IS NOT NULL
ORDER BY afi.negligible_risk ASC, afi.natural_land_deforested_area DESC
OFFSET (@pageNumber)*@rowsOfPage ROWS FETCH NEXT @rowsOfPage ROWS ONLY;
`;

/**
 * This query to get paginated AFI Analysis for a list by location
 * The command requires the following parameters:
 * @listId AS INT,
 * @rowsOfPage AS INT
 * @pageNumber AS INT
 */
export const getPaginatedAfiAnalysisLocationLevel = `
DECLARE @list_table NVARCHAR(150)
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @locationColumn NVARCHAR(100)

SELECT @list_table = list_table_name, @listName = list_Name FROM [Lists] WHERE id = @listId

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
' afi.total_area_ha AS totalAreaHa, ' +
' afi.status_code as location_status_id, ' +
' afi.location_error as analysisError, ' +
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
' lt.[Sub State] as subState, ' +
' lt.ErrorDetails as errorDetails ' +
'FROM AFIAnalysis afi JOIN dbo.[' + @list_table + '] lt ON lt.location_id = afi.location_id ' +
'WHERE afi.location_id > 0 AND afi.list_id = @listId'


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
  analysisError: string;
  locationId: number;
  locationName?: string;
  naturalForestLossByYear: string;
  naturalForestLossHA: number;
  negligibleRisk: number;
  protectedAreasArea: number;
  state: string;
  location_status_id: number;
  errorDetails: string;
  subState: string;
  totalAreaHA: number;
}
