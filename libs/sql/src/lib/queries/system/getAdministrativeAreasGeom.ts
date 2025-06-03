/**
 * @param location_ids NVARCHAR(MAX)
 */
export const getAdministrativeAreasGeom = `
IF @location_ids IS NULL OR @location_ids = ''
    SELECT 1 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-administrativeAreas36]
ELSE
    BEGIN
        DECLARE @SQL NVARCHAR(MAX)
        SET @SQL = 'SELECT 1 as [list_id], location_id, Geometry.ToString() as [WKTGeometry] FROM [list-administrativeAreas36] WHERE location_id IN ({LOCATION_IDS})'
        SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids)
        EXEC sp_executesql @SQL
    END
`;
