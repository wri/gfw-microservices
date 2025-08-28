/**
 * @analysis_table_name NVARCHAR(150)
 * @location_ids_array NVARCHAR(MAX)
 * @location_status_id TINYINT
 */
export const updateLocationAnalysisStatusInBulk = `
BEGIN
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	SET @TEMPLATE = '
		BEGIN TRANSACTION
			UPDATE [{ANALYSIS_TABLE}]
			SET location_status_id = {LOCATION_STATUS_ID}
			WHERE location_id IN ({LOCATION_IDS})
		COMMIT TRANSACTION
	'

	SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table_name)
	SET @SQL = REPLACE(@SQL, '{LOCATION_STATUS_ID}', @location_status_id)
	SET @SQL = REPLACE(@SQL, '{LOCATION_IDS}', @location_ids_array)
	EXEC sp_executesql @SQL
END
`;
