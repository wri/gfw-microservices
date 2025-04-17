/**
 * This query to get paginated GHG Analysis for a list by location
 * The command requires the following parameters:
 * @listId AS INT,
 */
export const getGHGLocationErrorsByListId = `
DECLARE @list_table NVARCHAR(150)
DECLARE @listName  NVARCHAR(150)
DECLARE @SQL NVARCHAR(MAX)

SELECT @list_table = list_table_name , @listName = list_Name FROM [Lists] WHERE id = @listId

SET @SQL = 'SELECT  ' +
' ghg.location_error as locationError, ' +
' lt.[Location Name] as locationName  '+ 


'FROM GHGAnalyses ghg JOIN dbo.[' + @list_table + '] lt ON lt.location_id = ghg.location_id ' +
'WHERE ghg.location_id > 0 AND ghg.list_id = @listId AND ghg.location_error IS NOT NULL'


SET @SQL = @SQL + ' ORDER BY ghg.location_id ASC';

EXEC sp_executesql @SQL,
     N'@listId INT, @listName NVARCHAR(150)',
     @listId = @listId, @listName = @listName;
`;
