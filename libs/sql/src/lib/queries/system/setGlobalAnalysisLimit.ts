/**
 * @summary Insert Query: Inserts a new row for global analysis limits by subscription status with automatic update_time field using GETDATE()
 * @param {Int} subscriptionStatusId
 * @param {Decimal} MaxAreaPerList
 * @param {Decimal} MaxAreaAnalyzeablePerYear
 * @param {Float} tokens_per_year
 */
// 90900900900 is used as an effectively infinite value for max_locations_per_year
export const setGlobalAnalysisLimit = `INSERT INTO AnalysisLimits (OrgID, OrgType, MaxAreaPerList, MaxAreaAnalyzeablePerYear, tokens_per_year, max_locations_per_year, update_time)
VALUES (NULL, @subscriptionStatusId, @MaxAreaPerList, @MaxAreaAnalyzeablePerYear, @tokens_per_year, 90900900900, GETDATE());`;
