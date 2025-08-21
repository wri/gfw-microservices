/**
 * @list_id INT
 */
export const getMaxId = `
DECLARE @ANALYSIS_TABLE NVARCHAR(150)
					DECLARE @TEMPLATE NVARCHAR(MAX)
					DECLARE @SQL NVARCHAR(MAX)

					SET @ANALYSIS_TABLE = (
						SELECT list_table_name
						FROM Lists
						WHERE id = @list_id
					)

					SET @TEMPLATE = 'SELECT MAX(location_id) as max_id from [{TABLE_NAME}]'

					SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @ANALYSIS_TABLE)
					EXEC sp_executesql @SQL
			
`;
