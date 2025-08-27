/**
 * [dbo].[uspDeleteFolder]
	@folder_id INT
 * @user_id INT
 */
export const deleteFolder = `
DECLARE @SQL NVARCHAR(1000)
BEGIN
	EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
									@folder_id = @folder_id

	SET @SQL = 'DELETE FROM [dbo].[Folders] WHERE id = {FOLDER_ID} AND user_id = {USER_ID};'
	SET @SQL = REPLACE(@SQL, '{FOLDER_ID}', @folder_id)
	SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
	EXEC sp_executesql @SQL

	SELECT @@ROWCOUNT AS affected_rows
END
`;
