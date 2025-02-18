/**
 * @param listID INT,
 * @param locationID INT,
 * @param rowsRequested INT
 */
export const getListLocations = `
--DECLARE IMPORTANT VARIABLES
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @locationWhereStatement NVARCHAR(MAX)
DECLARE @listLocationTableCols NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

-- Obtain the needed columns from the List Location Table. (All but Geometry)
SELECT @listLocationTableCols = STUFF(
	(
		SELECT '], L.[' + [name] FROM sys.columns
		WHERE
			[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
			AND [name] NOT IN ('Geometry')
			FOR XML PATH('')
	),1,3,'') + ']';

-- Return data 
IF @rowsRequested > 0 
	BEGIN
		SET @SQL = 'SELECT TOP ({NUM_ROWS}) {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.ToString() as [WKTGeometry]
					FROM [{LOCATION_TABLE}] L
					WHERE location_id >= {MIN_LOCATION_ID}
					ORDER BY location_id';
		SET @SQL = REPLACE(@SQL, '{NUM_ROWS}', @rowsRequested);
		SET @SQL = REPLACE(@SQL, '{MIN_LOCATION_ID}', @locationID);
	END
ELSE
	BEGIN
		SET @SQL = 'SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS}, L.Geometry.ToString() as [WKTGeometry]
					FROM [{LOCATION_TABLE}] L';
	END

SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @listLocationTableCols);
SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);


EXEC sp_executesql @SQL;
GO
`;
