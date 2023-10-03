/**
 * This query to get paginated AFI Analysis for a list.
 * The command requires the following parameters:
 * @listID AS INT,
 * @isListLevel AS INT
 * @RowsOfPage AS INT
 * @PageNumber AS INT
 */
const getPaginatedAfiAnalysisByListId = `
DECLARE @filter NVARCHAR(MAX) = '';
DECLARE @SQL NVARCHAR(MAX) = '';

    IF  @isListLevel = 1
    BEGIN
        SET @filter = 'AND af.location_id IN (-1, -2) AND AF.gadm_id IS NOT NULL ';
    END
    ELSE
    BEGIN
        SET @filter = 'AND af.location_id NOT IN (-1, -2) ';
    END

    SET @filter = @filter + 'AND (AF.negligible_risk < 0.5 OR AF.negligible_risk > 99.5)';

    SET @SQL = ' SELECT AF.list_id as listID, '+
        ' AF.location_id as location_id, '+
        ' AF.gadm_id AS gadmId, '+
        ' AF.natural_land_area AS coverageHA, '+
        ' AF.natural_land_deforested_area AS naturalForestLossHA, '+
        ' AF.total_area_ha AS totalAreaHa, '+
        ' AF.status_code, '+
        ' AF.location_error, '+
        ' CASE '+
        ' WHEN AF.negligible_risk < 0.5 THEN CAST(0 AS BIT) '+
        ' WHEN AF.negligible_risk > 99.5 THEN CAST(1 AS BIT) '+
        ' ELSE NULL  '+
        ' END AS negligibleRisk,  '+
        ' AA.[Country] as country,  '+
        ' AA.[State] as state,  '+
        ' AA.[Sub State] as subState  '+
        ' FROM [AFIAnalysis] AF  '+
        ' LEFT JOIN gfwpro.dbo.[list-administrativeAreas] AA ON AA.gadmid = AF.gadm_id  '+
        ' WHERE AF.list_id = @listId ';

    SET @SQL = @SQL + @filter;

    IF @RowsOfPage > 0 AND @PageNumber > 0
    BEGIN
        SET @SQL = @SQL + 'ORDER BY  AF.negligible_risk OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY';
    END

    PRINT @SQL
    EXEC sp_executesql @SQL,
        N'@listId INT, @RowsOfPage INT, @PageNumber INT',
        @listId=@listID,@RowsOfPage=@RowsOfPage, @PageNumber=@PageNumber;
`;

class GetPaginatedAfiAnalysisByListId {
  listID: number;
  location_id: number;
  gadmId: string;
  coverageHA: number;
  naturalForestLossHA: number;
  totalAreaHa: number;
  status_code: string;
  location_error: string;
  negligibleRisk: boolean;
  country: string;
  state: string;
  subState: string;
}

export { getPaginatedAfiAnalysisByListId, GetPaginatedAfiAnalysisByListId };
