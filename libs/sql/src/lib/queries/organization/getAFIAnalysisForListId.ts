export const getAFIAnalysisForListId = `SELECT x.*
FROM [AFIAnalysis] x
WHERE [list_id] = @listId;`;
