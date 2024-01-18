export const getListLocationsCountQuery = `
SELECT
  list_locations_count
FROM dbo.[Lists] L
WHERE L.id = @listId;
`;
