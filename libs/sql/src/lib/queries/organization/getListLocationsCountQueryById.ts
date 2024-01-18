export const getListLocationsCountQueryById = `SELECT ISNULL(list_locations_count, 0) as listLocationsCount, id FROM dbo.[Lists] L
WHERE L.id = @listId
`;

export interface ListLocationsCountQueryById {
  listLocationsCount: number;
}
