/**
 * [dbo].[uspUpdateFolderAccessTime]
	@folder_id INT
 * @user_id INT
 */
export const updateFolderAccessTime = `
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

    -- Update the last_accessed_at timestamp
    UPDATE [dbo].[Folders]
    SET last_accessed_at = GETUTCDATE()
    WHERE id = @folder_id AND user_id = @user_id;
END
`;
