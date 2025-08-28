/**
 * [dbo].[uspGetFolder]
	@folder_id INT
 * @user_id INT
 */
export const getFolder = `
DECLARE @SQL NVARCHAR(1000)

BEGIN
	EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
									@folder_id = @folder_id

	SET @SQL = 'SELECT id, name, last_accessed_at as last_access_time, created_at as creation_time, null as lists FROM [dbo].[Folders]
				WHERE id = {FOLDER_ID} AND user_id = {USER_ID}'
	SET @SQL = REPLACE(@SQL, '{FOLDER_ID}', @folder_id)
	SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
	EXEC sp_executesql @SQL
END

`;
