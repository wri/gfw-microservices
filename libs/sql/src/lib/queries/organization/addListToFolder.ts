/**
 * [dbo].[uspAddListToFolder]
	@folder_id INT
 * @list_ids NVARCHAR(MAX)
 * @user_id INT
 */
export const addListToFolder = `
BEGIN
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @DELIMITER CHAR(1) = ',';

    -- validate folder exists (safe call to existing proc)
    EXEC [dbo].[uspDoesFolderExist] @user_id = @user_id,
                                   @folder_id = @folder_id;

    -- Use parameterized dynamic SQL to avoid injecting list values directly into the string.
    SET @SQL = N'
        INSERT INTO [dbo].[FolderItems] (list_id, folder_id)
        SELECT TRY_CAST(value AS INT) AS list_id, @FolderID
        FROM STRING_SPLIT(@Lists, @Delimiter)
        WHERE TRY_CAST(value AS INT) IS NOT NULL;
    ';

    EXEC sp_executesql
        @SQL,
        N'@Lists NVARCHAR(MAX), @FolderID INT, @Delimiter CHAR(1)',
        @Lists = @list_ids,
        @FolderID = @folder_id,
        @Delimiter = @DELIMITER;

    SELECT @@ROWCOUNT AS affected_rows;
END
`;
