/**
 * [dbo].[uspGetListsVectorTilesPath]
	@list_id SMALLINT
 */
export const getListVectorTilesPath = `
BEGIN

	SELECT vector_tiles_storage_path
	FROM dbo.Lists
	WHERE id = @list_id

END

`;
