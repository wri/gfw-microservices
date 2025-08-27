/**
 * [dbo].[uspCreateNewFolder]
	@name NVARCHAR(200)
 * @user_id INT
 */
export const createNewFolder = `
BEGIN
    -- Use parameterized statements instead of building SQL via string replacement
    INSERT INTO [dbo].[Folders] (name, user_id, last_accessed_at, created_at)
    VALUES (@name, @user_id, GETUTCDATE(), GETUTCDATE());

    SELECT id FROM [dbo].[Folders]
    WHERE name = @name AND user_id = @user_id;
END
`;
