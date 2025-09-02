/**
 * [dbo].[uspGetListStatus]
	@list_id INT
 */
export const getListStatus = `
BEGIN
		SELECT list_status_id FROM dbo.[Lists] WHERE id = @list_id
	END

`;
