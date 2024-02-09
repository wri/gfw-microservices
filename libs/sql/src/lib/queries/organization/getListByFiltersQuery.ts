export const getListByFiltersQuery = `
  SELECT 
    * 
  FROM 
    Lists 
  WHERE 
    (list_name = @listName OR @listName IS NULL)
  AND
    (id = @listId OR @listId IS NULL)
`;

export interface GetListByFilters {
  listName?: string;
  listId?: number;
}
