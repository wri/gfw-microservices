/**
 * [dbo].[uspDoesFolderExist]
	@user_id INT
 * @folder_id INT
 */
export const doesFolderExist = `
BEGIN
	DECLARE @SQL NVARCHAR(1000)
	DECLARE @rowcount INT 

	SET @SQL = 'SELECT @rowcount=COUNT(*) FROM [dbo].[Folders] WHERE id = {FOLDER_ID} AND user_id = {USER_ID}'
	SET @SQL = REPLACE(@SQL, '{FOLDER_ID}', @folder_id)
	SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
	EXEC sp_executesql @SQL, N'@rowcount int output', @rowcount output;

	IF @rowcount = 0
	BEGIN
		;THROW 50005, N'The list does not exists...', 1;
	END
END


`;
