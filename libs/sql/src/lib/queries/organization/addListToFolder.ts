/**
 * [dbo].[uspAddListToFolder]
	@folder_id INT
 * @list_ids NVARCHAR(MAX)
 * @user_id INT
 */
export const addListToFolder = `
BEGIN
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @DELIMITER CHAR(1)

	SET @DELIMITER = ','
		
	EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
									@folder_id = @folder_id

	SET @SQL = 'INSERT INTO [dbo].[FolderItems] (list_id, folder_id) SELECT value, {FOLDER_ID}
				FROM STRING_SPLIT(''{LISTS_IDS}'', ''{DELIMITER}'')
				WHERE RTRIM(value) <> '''';
				'

	SET @SQL = REPLACE(@SQL, '{FOLDER_ID}', @folder_id)
	SET @SQL = REPLACE(@SQL, '{LISTS_IDS}', @list_ids)
	SET @SQL = REPLACE(@SQL, '{DELIMITER}', @DELIMITER)
	EXEC sp_executesql @SQL

	SELECT @@ROWCOUNT AS affected_rows
END
`;
