/**
 * @list_table NVARCHAR(150)
 * @location_id INT
 */
export const getLocation = `
DECLARE @LIST_TEMPLATE_ID INT
							DECLARE @LOCATION_CLASSIFICATION NVARCHAR(150)
							DECLARE @TEMPLATE NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)

							--Obtain the template id and location classification for the list.
							SELECT @LIST_TEMPLATE_ID = template_id, @LOCATION_CLASSIFICATION = location_classification FROM Lists WHERE list_table_name = @list_table

							SET @TEMPLATE = '
								SELECT location_id, {LIST_TEMPLATE_ID} AS [template_id], ''{LOCATION_CLASSIFICATION}'' AS location_classification, Geometry.ToString() as [WKTGeometry]
								FROM [{TABLE_NAME}]
								WHERE location_id = {LOCATION_ID}
								'
								SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @list_table)
								SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
								SET @SQL = REPLACE(@SQL, '{LIST_TEMPLATE_ID}', @LIST_TEMPLATE_ID)
								SET @SQL = REPLACE(@SQL, '{LOCATION_CLASSIFICATION}', @LOCATION_CLASSIFICATION)
								EXEC sp_executesql @SQL
`;
