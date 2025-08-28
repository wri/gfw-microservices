/**
 * @list_name NVARCHAR(150)
 * @column_name NVARCHAR(50)
 * @value DECIMAL(18,6)
 */
export const updateListAnalysisNumberResult = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @listID INT

--Get List ID for the list.
SELECT @listID = id FROM Lists WHERE list_name = @list_name

SET @TEMPLATE = '
	BEGIN TRANSACTION
		UPDATE Analyses
		SET {COLUMN_NAME} = {VALUE}
		WHERE list_id = {LIST_ID}
	COMMIT TRANSACTION
'

SET @SQL = REPLACE(@TEMPLATE, '{COLUMN_NAME}', @column_name)
SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listID)
EXEC sp_executesql @SQL
`;
