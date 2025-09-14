/**
 * [dbo].[uspUpdateListCount]
				@table_name NVARCHAR(150)
 * @list_id INT
 */
export const updateListCount = `
DECLARE @SQL NVARCHAR(MAX)
SET @SQL = '
	UPDATE Lists
	SET list_locations_count = (
		SELECT COUNT (*)
		FROM [{TABLE_NAME}]
	)
	WHERE id = {LIST_ID}'
SET @SQL = REPLACE(@SQL, '{TABLE_NAME}', @table_name)
SET @SQL = REPLACE(@SQL, '{LIST_ID}', @list_id)
EXEC sp_executesql @SQL
`;
