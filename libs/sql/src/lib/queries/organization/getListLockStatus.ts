/**
 * @param list_id INT
 */
export const getListLockStatus = `
SELECT lock_status, lock_user_id FROM Lists WHERE id = @list_id
`;
