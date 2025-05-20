/**
 * @param list_id INT,
 * @param user_id INT
 */
export const setListLocked = `
DECLARE @date SMALLDATETIME
SET @date = getdate()
UPDATE Lists SET lock_status = @date, lock_user_id = @user_id WHERE id = @list_id
`;
