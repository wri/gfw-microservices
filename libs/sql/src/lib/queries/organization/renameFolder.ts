/**
 * [dbo].[uspRenameFolder]
	@folder_id INT
 * @folder_name NVARCHAR(200)
 * @user_id INT
 */
export const renameFolder = `
DECLARE @SQL NVARCHAR(1000)
BEGIN
	EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
									@folder_id = @folder_id

	SET @SQL = 'UPDATE [dbo].[Folders] SET name = ''{FOLDER_NAME}'' WHERE id = {FOLDER_ID} AND user_id = {USER_ID}'
	SET @SQL = REPLACE(@SQL, '{FOLDER_ID}', @folder_id)
	SET @SQL = REPLACE(@SQL, N'{FOLDER_NAME}', @folder_name)
	SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
	EXEC sp_executesql @SQL
END

`;
