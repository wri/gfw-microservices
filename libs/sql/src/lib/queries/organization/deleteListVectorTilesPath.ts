export const deleteListVectorTilesPath = `
    UPDATE dbo.Lists
    SET vector_tiles_storage_path = ''
    WHERE id = @list_id
`;
