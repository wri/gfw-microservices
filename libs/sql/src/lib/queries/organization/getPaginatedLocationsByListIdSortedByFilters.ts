/**
 * This query gets paginated locations for a list by location
 * The command requires the following parameters:
 *     @listId                INT,
 *     @rowsOfPage            INT,
 *     @pageNumber            INT,
 *     @Country               NVARCHAR(255),
 *     @State                 NVARCHAR(255),
 *     @SubState              NVARCHAR(255),
 *     @selectedSupplier      NVARCHAR(255),
 *     @selectedSecondSupplier NVARCHAR(255),
 *     @selectedParentCompany NVARCHAR(255),
 *     @showRSPOCertified     BIT,
 *     @SearchString          NVARCHAR(255),
 *     @orderType             NVARCHAR(255),
 *     @sortByAttribute       NVARCHAR(255)
 */

export const getPaginatedLocationsByListIdSortedByFilters = `
DECLARE @list_table             NVARCHAR(150);
DECLARE @listName               NVARCHAR(150);
DECLARE @SQL                    NVARCHAR(MAX);
DECLARE @Filters                NVARCHAR(MAX) = '';
DECLARE @DefaultOrderColumn     NVARCHAR(MAX) = 'lt.[Country]';
DECLARE @listVersion            INT;

SELECT
    @list_table = list_table_name,
    @listName   = list_name,
    @listVersion   = version
FROM [Lists]
WHERE id = @listId;

----------------------------------------------------------------
-- location_id, [Location Name] (or [Investment Name]),
-- Country, State, [Sub State], [ErrorDetails] in [@list_table].
-- other data is in [attributes] as JSON.
----------------------------------------------------------------
SET @SQL = N'
SELECT
    @listId AS listId,
    @listName AS listName,
    lt.location_id AS locationId,

    
    CASE
        IF @listVersion != 2 -- If "Location Name" doesn't exist but "Investment Name" does, use that
            BEGIN
                WHEN COL_LENGTH(''[dbo].[' + @list_table + ']'', ''Location Name'') IS NOT NULL THEN lt.[Location Name]
                WHEN COL_LENGTH(''[dbo].[' + @list_table + ']'', ''Investment Name'') IS NOT NULL THEN lt.[Investment Name]
                ELSE NULL
            END
        ELSE -- Investment name is not guaranteed for version=2
            BEGIN
                lt.[Location Name]
            END
        
        
    END AS locationName,

    lt.Country     AS country,
    lt.State       AS state,
    lt.[Sub State] AS subState,

    -- GPV-3647: Grab the entire JSON in [attributes]
    lt.[attributes] AS attributes,

    -- Keep totalRows for pagination
    COUNT(*) OVER () AS totalRows

FROM dbo.[' + @list_table + '] lt
WHERE 1=1 ';

------------------------------------------------------------
-- Add filters (on known columns that physically exist)
------------------------------------------------------------
IF @Country IS NOT NULL
    SET @Filters += ' AND lt.Country = @Country';

IF @State IS NOT NULL
    SET @Filters += ' AND lt.State = @State';

IF @SubState IS NOT NULL
    SET @Filters += ' AND lt.[Sub State] = @SubState';

IF @listVersion = 2
    BEGIN
        IF @selectedSupplier IS NOT NULL
            SET @Filters += ' AND CAST(JSON_VALUE(lt.attributes, ''$.[""Supplier Name""]'') AS NVARCHAR(150)) = @selectedSupplier';

        IF @selectedSecondSupplier IS NOT NULL
            SET @Filters = + @Filters + ' AND CAST(JSON_VALUE(lt.attributes, ''$.[""Second Supplier Name""]'') AS NVARCHAR(255)) = @selectedSecondSupplier'
        
        IF @selectedParentCompany IS NOT NULL
            SET @Filters = + @Filters + ' AND CAST(JSON_VALUE(lt.attributes, ''$.[""Parent Company""]'') AS NVARCHAR(255)) = @selectedParentCompany'
        
        IF @showRSPOCertified = 1
            SET @Filters = + @Filters + ' AND CAST(JSON_VALUE(lt.attributes, ''$.[""RSPO Model""]'') AS INT) = 1'

    END
ELSE
    BEGIN 
        IF @selectedSupplier IS NOT NULL
            SET @Filters += ' AND lt.[Supplier Name] = @selectedSupplier';

        IF @selectedSecondSupplier IS NOT NULL
            SET @Filters += ' AND lt.[Second Supplier Name] = @selectedSecondSupplier';

        IF @selectedParentCompany IS NOT NULL
            SET @Filters += ' AND lt.[Parent Company] = @selectedParentCompany';
        
        IF @showRSPOCertified = 1
            SET @Filters += ' AND lt.[RSPO Model] = 1';
    END



------------------------------------------------------------
-- Search across certain known columns
------------------------------------------------------------
IF (@SearchString IS NOT NULL)
BEGIN
    -- You can adapt or extend this list as needed
    SET @SQL += '
      AND (
             lt.Country LIKE @SearchString
             OR lt.State LIKE @SearchString
             OR lt.[Location Name] LIKE @SearchString
             OR lt.[Investment Name] LIKE @SearchString
          )';
END

------------------------------------------------------------
-- Append the dynamic filters to the main query
------------------------------------------------------------
IF (@Filters IS NOT NULL)
    SET @SQL += @Filters;

------------------------------------------------------------
-- Sorting logic
-- If @sortByAttribute is one of our known columns, use it;
-- otherwise default to Country ascending
------------------------------------------------------------
DECLARE @ltColumns NVARCHAR(MAX) = N'[Location Name], [Investment Name], Country, State, [Sub State]';
DECLARE @isValidSortColumn BIT = 0;

IF CHARINDEX(@sortByAttribute, @ltColumns) > 0
    SET @isValidSortColumn = 1;

IF (@orderType IS NOT NULL
    AND @sortByAttribute IS NOT NULL
    AND @isValidSortColumn = 1)
BEGIN
    SET @SQL += ' ORDER BY lt.[' + @sortByAttribute + '] ' + @orderType;
END
ELSE
BEGIN
    SET @SQL += ' ORDER BY ' + @DefaultOrderColumn + ' ASC';
END

------------------------------------------------------------
-- Pagination: OFFSET-FETCH
------------------------------------------------------------
IF @RowsOfPage > 0 AND @PageNumber > 0
BEGIN
    SET @SQL += '
     OFFSET (@PageNumber - 1) * @RowsOfPage ROWS
     FETCH NEXT @RowsOfPage ROWS ONLY';
END

------------------------------------------------------------
-- Execute the final dynamic SQL
------------------------------------------------------------
EXEC sp_executesql
    @SQL,
    N'@listId INT,
      @listName NVARCHAR(150),
      @rowsOfPage INT,
      @pageNumber INT,
      @Country NVARCHAR(255),
      @State NVARCHAR(255),
      @SubState NVARCHAR(255),
      @selectedSupplier NVARCHAR(255),
      @selectedSecondSupplier NVARCHAR(255),
      @selectedParentCompany NVARCHAR(255),
      @showRSPOCertified BIT,
      @SearchString NVARCHAR(255),
      @orderType NVARCHAR(255),
      @sortByAttribute NVARCHAR(255)',
    @listId                 = @listId,
    @listName               = @listName,
    @rowsOfPage             = @rowsOfPage,
    @pageNumber             = @pageNumber,
    @Country                = @Country,
    @State                  = @State,
    @SubState               = @SubState,
    @selectedSupplier       = @selectedSupplier,
    @selectedSecondSupplier = @selectedSecondSupplier,
    @selectedParentCompany  = @selectedParentCompany,
    @showRSPOCertified      = @showRSPOCertified,
    @SearchString           = @SearchString,
    @orderType              = @orderType,
    @sortByAttribute        = @sortByAttribute;
`;

export class PaginatedLocationsByListIdSortedByFilters {
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
