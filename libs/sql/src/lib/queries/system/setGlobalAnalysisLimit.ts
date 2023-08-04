export const setGlobalAnalysisLimit = `UPDATE AnalysisLimits 
SET MaxAreaPerList = @MaxAreaPerList,
  MaxAreaAnalyzeablePerYear = @MaxAreaAnalyzeablePerYear
WHERE OrgType = @subscriptionStatusId`;
