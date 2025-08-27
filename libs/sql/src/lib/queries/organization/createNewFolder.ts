/**
 * [dbo].[uspCreateNewFolder]
	@name NVARCHAR(200)
 * @user_id INT
 */
export const createNewFolder = `
BEGIN
		DECLARE @SQL NVARCHAR(1000)

		SET @SQL = 'INSERT INTO [dbo].[Folders] (name, user_id, last_accessed_at, created_at) VALUES (''{NAME}'', {USER_ID}, GETUTCDATE(), GETUTCDATE());
					SELECT id FROM Folders WHERE name = N''{NAME}'' AND user_id = {USER_ID}'
		SET @SQL = REPLACE(@SQL, '{NAME}', @name)
		SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
		EXEC sp_executesql @SQL
	END

`;
