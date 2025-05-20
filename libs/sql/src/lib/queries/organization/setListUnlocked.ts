/**
 * @param list_id INT,
 * @param user_id INT
 */
export const setListUnlocked = `
UPDATE Lists SET lock_status = NULL, lock_user_id = @user_id WHERE id = @list_id
`;
