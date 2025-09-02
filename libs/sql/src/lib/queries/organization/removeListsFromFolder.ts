/**
 * [dbo].[uspRemoveListsFromFolder]
	@folder_id INT
 * @list_ids NVARCHAR(MAX)
 * @user_id INT
 */
export const removeListsFromFolder = `
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

    -- Delete the specified lists from FolderItems
    DELETE FI
    FROM [dbo].[FolderItems] FI
    INNER JOIN [dbo].[Folders] F ON F.id = FI.folder_id
    WHERE FI.list_id IN (
        SELECT TRY_CAST([value] AS INT)
        FROM STRING_SPLIT(@list_ids, ',')
        WHERE TRY_CAST([value] AS INT) IS NOT NULL
    )
    AND FI.folder_id = @folder_id
    AND F.user_id = @user_id;

    SELECT @@ROWCOUNT AS affected_rows;
END
`;
