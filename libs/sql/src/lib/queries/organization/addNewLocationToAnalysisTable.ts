/**
 * @param start_location_id INT
 */
export const addNewLocationToAnalysisTable = `
DECLARE @analyisTableName NVARCHAR(150)
DECLARE @listTableName NVARCHAR(150)

SET @analyisTableName = (
    SELECT list_analysis_table_name
    FROM Lists
    WHERE id = @list_id
)
SET @listTableName = (
    SELECT list_table_name
    FROM Lists
    WHERE id = @list_id
)

DECLARE @SQL NVARCHAR(MAX)
SET @SQL = 
    'INSERT INTO [' + @analyisTableName + '](location_id, location_status_id)
     SELECT location_id, 1
     FROM [' + @listTableName + ']
     WHERE location_id > ' + CAST(@start_location_id AS NVARCHAR)
EXEC sp_executesql @SQL

DECLARE @SQL2 NVARCHAR(MAX)
SET @SQL2 = 
    'SELECT location_id, Geometry.ToString() as WKTGeometry
     FROM [' + @listTableName + ']
     WHERE location_id > ' + CAST(@start_location_id AS NVARCHAR)
EXEC sp_executesql @SQL2
`;

export interface newLocation {
  location_id: number;
  WKTGeometry: string;
}
