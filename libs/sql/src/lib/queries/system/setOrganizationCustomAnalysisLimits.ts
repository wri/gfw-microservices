/**
 * @summary Insert Query: Inserts a new row for each call with automatic update_time field using GETDATE(), does not update existing rows
 * @param {Int} OrgID
 * @param {Decimal} MaxAreaPerList
 * @param {Decimal} MaxAreaAnalyzeablePerYear
 * @param {Int} MaxLocationsPerYear
 */
export const setOrganizationCustomAnalysisLimits = `INSERT INTO AnalysisLimits (OrgID, OrgType, MaxAreaPerList, MaxAreaAnalyzeablePerYear, MaxLocationsPerYear, update_time)
VALUES (@OrgID, NULL, @MaxAreaPerList, @MaxAreaAnalyzeablePerYear, @MaxLocationsPerYear, GETDATE());`;
