/**
 * [dbo].[uspGetListLocationsNoGeom]
							@listID INT
 * @ColumnsToReturn NVARCHAR(MAX) = NULL
 */
export const getListLocationsNoGeom = `
--DECLARE IMPORTANT VARIABLES
							DECLARE @listLocationTableName NVARCHAR(1000)
							DECLARE @listLocationTableCols NVARCHAR(MAX)
							DECLARE @columnsList NVARCHAR(MAX)
							DECLARE @SQL NVARCHAR(MAX)

							-- Obtain the location table name and the analysis table name for the list.
							SELECT @listLocationTableName = list_table_name FROM Lists WHERE id = @listID				
							
							IF @ColumnsToReturn IS NOT NULL
								BEGIN
									DECLARE @PRESQL NVARCHAR(MAX);
									DECLARE @presql_list_params NVARCHAR(MAX) = '@list_location_table_cols_query VARCHAR(MAX) OUTPUT';

									WITH ColumnsCTE AS (
										SELECT TRIM(value) AS cols FROM STRING_SPLIT(@ColumnsToReturn, ',')
									)

									SELECT @columnsList = CONCAT('''', STRING_AGG(cols, ''', '''), '''')
									FROM ColumnsCTE;

									-- Obtain the needed columns from the List Location Table. 
									SET @PRESQL = N'SELECT @list_location_table_cols_query = STUFF(
										  (
											SELECT ''], L.['' + [name] FROM sys.columns
											WHERE
											  [object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = ''{LIST_LOCATION_TABLE_NAME}'')
											  AND [name] IN ({COLUMNS_LIST}) 
											  FOR XML PATH('''')
										  ),1,3,'''') + '']''';
									SET @PRESQL = REPLACE(@PRESQL, '{LIST_LOCATION_TABLE_NAME}', @listLocationTableName)
									SET @PRESQL = REPLACE(@PRESQL, '{COLUMNS_LIST}', @columnsList);

									EXEC sp_executesql @PRESQL, @presql_list_params, @list_location_table_cols_query = @listLocationTableCols OUTPUT;

								END
					
							ELSE
								BEGIN
									-- Obtain the needed columns from the List Location Table. (All but Geometry)
									SELECT @listLocationTableCols = STUFF(
										(
											SELECT '], L.[' + [name] FROM sys.columns
											WHERE
												[object_id] = (SELECT [object_id] FROM sys.objects WHERE [name] = @listLocationTableName)
												AND [name] NOT IN ('Geometry')											
												FOR XML PATH('')
										),1,3,'') + ']';
								END							

							-- Return data from both tables
							SET @SQL = 'SELECT {LIST_ID} As list_id, {LOCATION_COLUMNS} FROM [{LOCATION_TABLE}] L';
							SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID);
							SET @SQL = REPLACE(@SQL, '{LOCATION_COLUMNS}', @listLocationTableCols);
							SET @SQL = REPLACE(@SQL, '{LOCATION_TABLE}', @listLocationTableName);

							EXEC sp_executesql @SQL
						
`;
