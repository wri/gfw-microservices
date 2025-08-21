/**
 * @list_id INT
 */
export const getUsersInternalShareLists = `
SELECT * FROM InternalShareRoutes
							WHERE list_id = @list_id


`;
