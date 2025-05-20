/**
 * @param list_id INT
 */
export const getListUsers = `
SELECT * FROM InternalShareRoutes
WHERE list_id = @list_id
`;
