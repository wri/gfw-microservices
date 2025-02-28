/**
 * @param document_name NVARCHAR(250)
 */
export const deletePolicy = `
DELETE FROM Policies
WHERE document_name=@document_name`;
