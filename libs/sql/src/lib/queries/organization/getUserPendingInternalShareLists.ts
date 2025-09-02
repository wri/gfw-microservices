/**
 * @user_id INT
 */
export const getUserPendingInternalShareLists = `
SELECT * FROM InternalShareRoutes
							WHERE
								user_id = @user_id


`;
