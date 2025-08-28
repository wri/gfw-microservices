/**
 * [dbo].[uspGetFolderItems]
	@folder_id INT
 * @user_id INT
 */
export const getFolderItems = `
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

    -- Select distinct list_ids for the folder
    SELECT DISTINCT list_id
    FROM [dbo].[FolderItems]
    WHERE folder_id = @folder_id;
END
`;
