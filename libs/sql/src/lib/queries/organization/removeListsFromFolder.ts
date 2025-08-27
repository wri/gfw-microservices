/**
 * [dbo].[uspRemoveListsFromFolder]
	@folder_id INT
 * @list_ids NVARCHAR(MAX)
 * @user_id INT
 */
export const removeListsFromFolder = `
DECLARE @SQL NVARCHAR(1000)

BEGIN

	EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
									@folder_id = @folder_id
	SET @SQL = 'DELETE [dbo].[FolderItems] FROM [dbo].[FolderItems] INNER JOIN [dbo].[Folders] F ON F.id = folder_id
				WHERE list_id IN ({LIST_ID}) AND folder_id = {FOLDER_ID} AND F.user_id = {USER_ID}'
	SET @SQL = REPLACE(@SQL, '{FOLDER_ID}', @folder_id)
	SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
	SET @SQL = REPLACE(@SQL, '{LIST_ID}', @list_ids)
	EXEC sp_executesql @SQL

	SELECT @@ROWCOUNT AS affected_rows
END
`;
