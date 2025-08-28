/**
 * Rename a folder for a user, ensuring the folder exists and belongs to the user.
 * @folder_id INT
 * @folder_name NVARCHAR(200)
 * @user_id INT
 */
export const renameFolder = `
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

    -- Perform the update
    UPDATE [dbo].[Folders]
    SET name = @folder_name
    WHERE id = @folder_id AND user_id = @user_id;
END
`;
