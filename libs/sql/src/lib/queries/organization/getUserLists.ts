/**
 * @param user_id INT
 */
export const getUserLists = `
SELECT L.*, LL.large_list_id
FROM Lists L
LEFT JOIN LargeLists LL ON L.id=LL.list_id
WHERE user_id = @user_id
ORDER BY list_name
`;
