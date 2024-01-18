export const getListLocationsCountQueryById = `
SELECT
  list_locations_count as listLocationsCount
FROM dbo.[Lists] L
WHERE L.id = @listId;
`;

export interface ListLocationsCountQueryById {
  listLocationsCount: number;
}
