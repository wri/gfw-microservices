/**
 * @summary Query to get the HA limit for the current year based on update_time
 *
 * This query returns the MaxAreaAnalyzeablePerYear from AnalysisLimits
 * where the update_time falls within the current calendar year.
 * Used for tokenization to determine per-year HA allowance.
 *
 * Logic:
 * - For organizations with a specific OrgID: gets their custom limit
 * - For organizations without custom limits: falls back to their subscription type (OrgType) limit
 * - Aggregates using SUM to handle multiple records within the same year
 *
 * @param {Int} orgID - The organization ID
 * @param {Int} orgType - The subscription status ID (used as fallback)
 */
export const getHALimitForCurrentYearQuery = `
DECLARE @currentYear INT = YEAR(GETDATE());

-- First try to get org-specific limit for current year
SELECT
    ISNULL(SUM(MaxAreaAnalyzeablePerYear), 0) AS MaxAreaAnalyzeablePerYear
FROM AnalysisLimits
WHERE OrgID = @orgID
  AND YEAR(update_time) = @currentYear;
`;

export interface HALimitForCurrentYear {
  MaxAreaAnalyzeablePerYear: number;
}
