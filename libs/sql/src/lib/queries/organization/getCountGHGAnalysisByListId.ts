/**
 * This query count the number of elements of existing AFI Analysis for a list.
 * The command requires the following parameters:
 * @listID AS INT,
 * @isListLevel AS INT
 */
const getCountGHGAnalysisByListId = `
DECLARE @SQL NVARCHAR(MAX) = '';

SET @SQL = 'SELECT COUNT(*) as quantity, @listId as id FROM [dbo].[GHGAnalyses] af WHERE af.list_id = @listID ';

EXEC sp_executesql @SQL,
    N'@listId INT',
    @listId=@listId;
`;

class CountGHGAnalysisByListId {
  id: number;
  quantity: number;
}

export { getCountGHGAnalysisByListId, CountGHGAnalysisByListId };
