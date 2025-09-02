/**
 * [dbo].[uspCopyLocations]
						@list_id INT
 * @location_ids NVARCHAR(400)
 */
export const copyLocations = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @sourceTable NVARCHAR(MAX)

SELECT @sourceTable = list_table_name FROM dbo.Lists where id = @list_id

SET @TEMPLATE = '
	SELECT *, Geometry.ToString() as WKTGeometry INTO #TempTable FROM [{LIST_TABLE}]
	WHERE location_id IN({LISTIDS})
	ALTER TABLE #TempTable
	DROP COLUMN location_id
	SELECT * FROM #TempTable
	DROP TABLE #TempTable
'
SET @SQL = REPLACE(@TEMPLATE, '{LIST_TABLE}', @sourceTable)
SET @SQL = REPLACE(@SQL, '{LISTIDS}', @location_ids)
EXEC(@SQL)
`;
