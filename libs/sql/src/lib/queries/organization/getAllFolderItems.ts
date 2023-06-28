export const getAllFolderItems = `DECLARE @SQL NVARCHAR(1000)
BEGIN
  SET @SQL = 'SELECT * FROM [dbo].[FolderItems] WHERE folder_id IN (SELECT id FROM [dbo].[Folders] WHERE USER_ID = {USER_ID});'
  SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
  EXEC sp_executesql @SQL
END`;
