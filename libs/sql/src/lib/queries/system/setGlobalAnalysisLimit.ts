/**
 * @summary this query updates the default values for analysis limits by subscription status
 * @param {Int} subscriptionStatusId
 * @param {Decimal} MaxAreaPerList
 * @param {Decimal} MaxAreaAnalyzeablePerYear
 * @param {Int} max_locations_per_year
 */
export const setGlobalAnalysisLimit = `UPDATE AnalysisLimits 
SET MaxAreaPerList = @MaxAreaPerList,
  MaxAreaAnalyzeablePerYear = @MaxAreaAnalyzeablePerYear,
  max_locations_per_year = @max_locations_per_year
WHERE OrgType = @subscriptionStatusId`;
