/**
 * [dbo].[uspGetAdminAreas]
	@listID INT
 */
export const getAdminAreas = `
DECLARE @listLocationTableName NVARCHAR(1000)
DECLARE @SQL NVARCHAR(MAX)

-- Obtain the location table name and the analysis table name for the list.
SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID

-- Obtain the needed columns from the List Location Table. (All but Geometry)
SET @SQL = 'SELECT DISTINCT Country, State, [Sub State] From ['+@listLocationTableName+'] ORDER BY Country, State, [Sub State]'

EXEC sp_executesql @SQL, 
					N'@listLocationTableName AS NVARCHAR(1000)',
					@listLocationTableName=@listLocationTableName

`;
