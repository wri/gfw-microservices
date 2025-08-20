/**
 * [dbo].[uspGetFailedLocationNames]
    			@list_table NVARCHAR(150)
 * @analysis_table NVARCHAR(150)
 */
export const getFailedLocationNames = `
DECLARE @TEMPLATE_ID INT
    			DECLARE @SQL NVARCHAR(MAX)

					-- Check whether this is an investment template or not.
					SELECT @TEMPLATE_ID = template_id FROM Lists WHERE list_table_name = @list_table

					-- If the template id is 1 (Investment, get Investment Name)
					IF @TEMPLATE_ID = 1
					BEGIN
						SET @SQL = 'SELECT [Investment Name] AS Name FROM [{LIST_TABLE}] l INNER JOIN [{ANALYSIS_TABLE}] a ON l.location_id = a.location_id WHERE a.location_status_id = 3'
					END
					ELSE
					BEGIN
						SET @SQL = 'SELECT [Location Name] AS Name FROM [{LIST_TABLE}] l INNER JOIN [{ANALYSIS_TABLE}] a ON l.location_id = a.location_id WHERE a.location_status_id = 3'
					END
    			SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table)
    			SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysis_table)
    			EXEC sp_executesql @SQL
`;
