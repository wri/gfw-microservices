/**
 * @analysis_table_name NVARCHAR(150)
 * @location_id INT
 * @location_status_id INT
 */
export const updateLocationAnalysisStatus = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @TEMPLATE = '
	BEGIN TRANSACTION
		UPDATE [{ANALYSIS_TABLE}]
		SET location_status_id = {LOCATION_STATUS_ID}
		WHERE location_id = {LOCATION_ID}
	COMMIT TRANSACTION
'

SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table_name)
SET @SQL = REPLACE(@SQL, '{LOCATION_STATUS_ID}', @location_status_id)
SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
EXEC sp_executesql @SQL
`;
