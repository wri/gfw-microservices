/**
 * [dbo].[uspDeleteFolder]
	@folder_id INT
 * @user_id INT
 */
export const deleteFolder = `
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

    -- Delete the folder
    DELETE FROM [dbo].[Folders]
    WHERE id = @folder_id AND user_id = @user_id;

    SELECT @@ROWCOUNT AS affected_rows;
END
`;
