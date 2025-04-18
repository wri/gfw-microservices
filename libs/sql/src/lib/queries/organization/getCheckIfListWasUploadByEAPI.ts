/**
 * Check if the list was uploaded by EAPI
 * @listId INT
 */
export const getListIfEAPIExportUpload = `
DECLARE @SQL NVARCHAR(MAX)

SET @SQL = 'SELECT '+
    ' ll.list_id as ListId ' +
' FROM dbo.LargeLists ll ' +
' INNER JOIN dbo.ExternalUploads eu ON ll.s3_filename = eu.uploadKeyFile  ' +
' WHERE ll.list_id = @listId ';

EXEC sp_executesql @SQL,
    N'@listId INT',
    @listId = @listId;
`;
export interface getListIfEAPIExportUploadExport {
  ListId: number;
}
