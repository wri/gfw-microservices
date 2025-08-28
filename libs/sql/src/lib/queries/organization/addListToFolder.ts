/**
 * [dbo].[uspAddListToFolder]
	@folder_id INT
 * @list_ids NVARCHAR(MAX)
 * @user_id INT
 */
export const addListToFolder = `
BEGIN
    -- Check if the folder exists and belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM [dbo].[Folders]
        WHERE id = @folder_id AND user_id = @user_id
    )
    BEGIN
        THROW 50005, N'The folder does not exist or does not belong to the user.', 1;
        RETURN;
    END

    -- Insert the lists into FolderItems
    INSERT INTO [dbo].[FolderItems] (list_id, folder_id)
    SELECT TRY_CAST([value] AS INT) AS list_id, @folder_id
    FROM STRING_SPLIT(@list_ids, ',')
    WHERE TRY_CAST([value] AS INT) IS NOT NULL;

    SELECT @@ROWCOUNT AS affected_rows;
END
`;
