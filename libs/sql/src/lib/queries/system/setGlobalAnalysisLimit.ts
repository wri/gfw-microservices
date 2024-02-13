/**
 * @summary this query updates the default values for analysis limits by subscription status
 * @param {Int} subscriptionStatusId
 * @param {Decimal} MaxAreaPerList
 * @param {Decimal} MaxAreaAnalyzeablePerYear
 * @param {Int} MaxLocationsPerYear
 */
export const setGlobalAnalysisLimit = `UPDATE AnalysisLimits 
SET MaxAreaPerList = @MaxAreaPerList,
  MaxAreaAnalyzeablePerYear = @MaxAreaAnalyzeablePerYear,
  MaxLocationsPerYear = @MaxLocationsPerYear
WHERE OrgType = @subscriptionStatusId`;
