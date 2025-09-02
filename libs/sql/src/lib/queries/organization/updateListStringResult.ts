/**
 * [dbo].[uspUpdateListStringResult]
	@list_id INT
 * @column_name NVARCHAR(50)
 * @value VARCHAR(MAX)
 */
export const updateListStringResult = `
BEGIN

	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	
	IF @column_name IN ('vector_tiles_storage_path', 'error_file_storage_path')
		BEGIN
			SET @TEMPLATE = '
				BEGIN TRANSACTION
					UPDATE dbo.[Lists]
					SET {COLUMN_NAME} = ''{VALUE}''
					WHERE id = {LIST_ID}
				COMMIT TRANSACTION
			'

			SET @SQL = REPLACE(@TEMPLATE, '{COLUMN_NAME}', @column_name)
			SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
			SET @SQL = REPLACE(@SQL, '{LIST_ID}', @list_id)
			EXEC sp_executesql @SQL
		END
	ELSE
		RAISERROR ('Invalid Column Name.', 1, 1);

END
`;
