/**
 * [dbo].[uspGetListGeometries]
					@list_table NVARCHAR(500)
 */
export const getListGeometries = `
DECLARE @TEMPLATE NVARCHAR(1000)
					DECLARE @SQL NVARCHAR(1000)

					SET  @TEMPLATE = 'SELECT Geometry.ToString() as [WKTGeometry] FROM [{TABLE}]'

					SET @SQL = REPLACE(@TEMPLATE, '{TABLE}', @list_table)
					EXEC sp_executesql @SQL
			
`;
