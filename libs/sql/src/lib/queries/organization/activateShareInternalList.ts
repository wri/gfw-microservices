/**
 * @param user_id INT
 * @param list_id INT
 * @param datetime DATETIME
 */
export const activateShareInternalList = `
UPDATE InternalShareRoutes
SET datetime = @datetime
WHERE
    admin_id = @admin_id AND
    user_id = @user_id AND
    list_id = @list_id'')'
SET @SQL = REPLACE(@TEMPLATE, '{DATABASENAME}', @OrgdbName)
EXEC sp_executesql @SQL
`;
