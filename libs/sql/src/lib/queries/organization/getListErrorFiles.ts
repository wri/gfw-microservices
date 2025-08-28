/**
 * [dbo].[uspGetListErrorFiles]
	@list_id SMALLINT NULL
 */
export const getListErrorFiles = `
BEGIN
	IF @list_id IS NOT NULL
		SELECT error_file_storage_path
		FROM dbo.Lists
		WHERE error_file_storage_path IS NOT NULL AND id = @list_id

	ELSE
		SELECT id, error_file_storage_path
		FROM dbo.Lists
		WHERE error_file_storage_path IS NOT NULL

END

`;
