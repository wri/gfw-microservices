const getFolders = `DECLARE @SQL NVARCHAR(1000)
BEGIN
  SET @SQL = 'SELECT id, name, last_accessed_at, created_at FROM [dbo].[Folders] WHERE user_id = {USER_ID}'
  SET @SQL = REPLACE(@SQL, '{USER_ID}', @user_id)
  EXEC sp_executesql @SQL
END`;

export { getFolders };
