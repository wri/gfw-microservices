/**
 * Gets the analysis usage for organization users without aggregation
 * The command requires the following parameters:
 * @listId INT
 */
export const getCheckIfListWasUploadByEAPI = `
DECLARE @SQL NVARCHAR(MAX)

SET @SQL = 'SELECT
    lp.list_id as 'List ID',
FROM dbo.ListsProcessing lp
LEFT JOIN dbo.LargeLists ll ON lp.list_id = ll.list_id
LEFT JOIN dbo.ExternalUploads eu ON ll.s3_filename = eu.uploadKeyFile 
WHERE lp.user_id IS NOT NULL and lp.list_id = @listId'

EXEC sp_executesql @SQL,
    N'@listId INT',
    @listId = @listId;
`;
