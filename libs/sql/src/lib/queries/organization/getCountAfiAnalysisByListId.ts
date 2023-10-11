/**
 * This query count the number of elements of existing AFI Analysis for a list.
 * The command requires the following parameters:
 * @listID AS INT,
 * @isListLevel AS INT
 */
const getCountAfiAnalysisByListId = `
DECLARE @filter NVARCHAR(MAX) = '';
DECLARE @SQL NVARCHAR(MAX) = '';

IF  @isListLevel = 1
BEGIN
    SET @filter = 'AND af.location_id < 0';
END
ELSE
BEGIN
    SET @filter = 'AND af.location_id > 0';
END

SET @SQL = 'SELECT COUNT(*) as quantity, @listId as id FROM [dbo].[AFIAnalysis] af WHERE af.list_id = @listID ';
SET @SQL = @SQL + @filter;

EXEC sp_executesql @SQL,
    N'@listId INT',
    @listId=@listId;
`;

class CountAfiAnalysisByListId {
  id: number;
  quantity: number;
}

export { getCountAfiAnalysisByListId, CountAfiAnalysisByListId };
