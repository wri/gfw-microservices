/**
 * [dbo].[uspSetAnalysisLocationPending]
				@list_id INT
 * @start_location_id INT
 */
export const setAnalysisLocationPending = `
DECLARE @analyisTableName NVARCHAR(150)
DECLARE @TEMPLATE NVARCHAR(1000)
DECLARE @SQL NVARCHAR(1000)

SET @analyisTableName = (
	SELECT list_analysis_table_name
	FROM Lists
	WHERE id = @list_id
)

SET @TEMPLATE = '
	UPDATE [{ANALYSIS_TABLE}]
	SET location_status_id = 1
	WHERE location_id > {START_LOCATION_ID}
'
SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analyisTableName)
SET @SQL = REPLACE(@SQL, '{START_LOCATION_ID}', @start_location_id)

EXEC sp_executesql @SQL
`;
