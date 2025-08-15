/**
 * @param location_ids NVARCHAR(MAX)
 */
export const getAdministrativeAreaAttributes = `
DECLARE @location_ids NVARCHAR(MAX) = NULL

IF @location_ids IS NULL OR @location_ids = ''
      SELECT 1 AS [list_id],[Location Name],Country,State,[Sub State],Latitude,Longitude,[Location Classification],Size,location_id FROM [list-administrativeAreas41]
ELSE
    BEGIN
        DECLARE @SQL NVARCHAR(MAX)
        SET @SQL = 'SELECT 1 AS [list_id],[Location Name],Country,State,[Sub State],Latitude,Longitude,[Location Classification],Size,location_id FROM [list-administrativeAreas41] WHERE location_id IN ({LOCATION_IDS})'
        SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
        EXEC sp_executesql @SQL
    END
`;
