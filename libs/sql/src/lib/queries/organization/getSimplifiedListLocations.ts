/**
 * @param listID INT
 */
export const getSimplifiedListLocations = `
--DECLARE IMPORTANT VARIABLES
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

-- Obtain the needed columns from the List Location Table. (All but Geometry)
SELECT @listLocationTableCols = STUFF(
    (
        SELECT ''''], L.['''' + [name] FROM sys.columns
        WHERE
            [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
            AND [name] NOT IN (''''Geometry'''')
            FOR XML PATH('''''''')
    ),1,3,'''''''') + '''']'''';

-- Return data from both tables
SET @SQL = ''''SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.Reduce(0.008).ToString() as [WKTGeometry] FROM [{LOCATION_TABLE}] L'''';
SET @SQL = REPLACE(@SQL, ''''{LIST_ID}'''', @listID);
SET @SQL = REPLACE(@SQL, ''''{LOCATION_COLUMNS}'''', @listLocationTableCols);
SET @SQL = REPLACE(@SQL, ''''{LOCATION_TABLE}'''', @listLocationTableName);
EXEC sp_executesql @SQL`;
