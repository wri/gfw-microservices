/**
 * @analysis_table_name NVARCHAR(150)
 * @location_id INT
 * @column_name NVARCHAR(50)
 * @value DECIMAL(18,6)
 */
export const updateLocationAnalysisNumberResult = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @TEMPLATE = '
	BEGIN TRANSACTION
		UPDATE [{ANALYSIS_TABLE}]
		SET {COLUMN_NAME} = {VALUE}
		WHERE location_id = {LOCATION_ID}
	COMMIT TRANSACTION
'

SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table_name)
SET @SQL = REPLACE(@SQL, '{COLUMN_NAME}', @column_name)
SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
SET @SQL = REPLACE(@SQL, '{LOCATION_ID}', @location_id)
EXEC sp_executesql @SQL
`;
