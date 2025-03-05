/**
 * @param list_id INT
 */
export const deactivateShareInternalList = `
DELETE FROM InternalShareRoutes
WHERE user_id = @user_id AND list_id = @list_id

DELETE FROM [dbo].[FolderItems] 
WHERE folder_id IN (SELECT id FROM [Folders] WHERE USER_ID = @user_id) AND list_id = @list_id`;
