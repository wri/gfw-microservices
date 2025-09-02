/**
 * [dbo].[uspShareInternalList]
	@admin_id INT
 * @user_id INT
 * @list_id INT
 * @datetime DATETIME
 */
export const shareInternalList = `
INSERT INTO InternalShareRoutes(admin_id, user_id, list_id, datetime) VALUES (@admin_id, @user_id, @list_id, @datetime);
`;
