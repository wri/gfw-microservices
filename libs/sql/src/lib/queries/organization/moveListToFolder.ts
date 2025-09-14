/**
 * [dbo].[uspMoveListToFolder]
	@from_folder_id INT
 * @to_folder_id INT
 * @list_ids NVARCHAR(MAX)
 * @user_id INT
 */
export const moveListToFolder = `
BEGIN
    -- Check if the destination folder exists and belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM [dbo].[Folders]
        WHERE id = @to_folder_id AND user_id = @user_id
    )
    BEGIN
        THROW 50005, N'The destination folder does not exist or does not belong to the user.', 1;
        RETURN;
    END

    -- Check if the source folder exists and belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM [dbo].[Folders]
        WHERE id = @from_folder_id AND user_id = @user_id
    )
    BEGIN
        THROW 50005, N'The source folder does not exist or does not belong to the user.', 1;
        RETURN;
    END

    -- Update the folder_id for the specified list_ids
    UPDATE [dbo].[FolderItems]
    SET folder_id = @to_folder_id
    WHERE list_id IN (
        SELECT TRY_CAST([value] AS INT)
        FROM STRING_SPLIT(@list_ids, ',')
        WHERE TRY_CAST([value] AS INT) IS NOT NULL
    )
    AND folder_id = @from_folder_id;

    SELECT @@ROWCOUNT AS affected_rows;
END
`;
