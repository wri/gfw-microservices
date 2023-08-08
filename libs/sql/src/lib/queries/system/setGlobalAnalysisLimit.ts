/**
 * @summary this query updates the default values for analysis limits by subscription status
 * @param {Int} subscriptionStatusId
 */
export const setGlobalAnalysisLimit = `UPDATE AnalysisLimits 
SET MaxAreaPerList = @MaxAreaPerList,
  MaxAreaAnalyzeablePerYear = @MaxAreaAnalyzeablePerYear
WHERE OrgType = @subscriptionStatusId`;
