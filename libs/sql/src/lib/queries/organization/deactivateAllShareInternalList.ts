/**
 * @param list_id INT
 */
export const deactivateAllShareInternalList = `
DELETE FROM InternalShareRoutes
WHERE list_id = @list_id AND user_id IN 
    (SELECT value FROM STRING_SPLIT(@user_id, '''',''''))

DELETE FROM [dbo].[FolderItems]
WHERE folder_id IN 
    (SELECT id FROM [Folders] 
        WHERE USER_ID IN 
            (SELECT value FROM STRING_SPLIT(@user_id, '''',''''))) 
                AND list_id = @list_id`;
