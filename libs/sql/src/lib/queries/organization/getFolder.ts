/**
 * [dbo].[uspGetFolder]
	@folder_id INT
 * @user_id INT
 */
export const getFolder = `
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

    -- Select folder details
    SELECT 
        id, 
        name, 
        last_accessed_at as last_access_time, 
        created_at as creation_time, 
        null as lists
    FROM [dbo].[Folders]
    WHERE id = @folder_id AND user_id = @user_id;
END
`;
