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

-- Insert New Rows into Analysis Table.
DECLARE @TEMPLATE NVARCHAR(1000)
DECLARE @SQL NVARCHAR(1000)
SET @TEMPLATE = ''''
    INSERT INTO [{ANALYSIS_TABLE}](location_id, location_status_id)
        SELECT location_id, 1
        FROM [{LIST_TABLE}]
        WHERE location_id > {START_LOCATION_ID}
''''
SET @SQL = REPLACE(@TEMPLATE, ''''{ANALYSIS_TABLE}'''', @analyisTableName)
SET @SQL = REPLACE(@SQL, ''''{LIST_TABLE}'''', @listTableName)
SET @SQL = REPLACE(@SQL, ''''{START_LOCATION_ID}'''', @start_location_id)
EXEC sp_executesql @SQL

DECLARE @TEMPLATE2 NVARCHAR(1000)
DECLARE @SQL2 NVARCHAR(1000)

SET @TEMPLATE2 = ''''
    SELECT location_id, Geometry.ToString() as WKTGeometry
    FROM [{LIST_TABLE}]
    WHERE location_id > {START_LOCATION_ID}
''''

SET @SQL2 = REPLACE(@TEMPLATE2, ''''{LIST_TABLE}'''', @listTableName)
SET @SQL2 = REPLACE(@SQL2, ''''{START_LOCATION_ID}'''', @start_location_id)
EXEC sp_executesql @SQL2
`;
