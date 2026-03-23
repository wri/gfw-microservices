/**
 * This query is used to get the analysis limit considering an organization id or type.
 * The command requires the following parameters:
 * @orgID INT,
 * @orgType INT,
 *
 * IMPORTANT: orgType should always be NULL if orgID is specified, and vice versa.
 * orgType is a general config; orgID is for orgs that bought extra credits.
 */

export const getAnalysisLimits = `BEGIN

DECLARE @SQL NVARCHAR(MAX)

    SET @SQL =  'SELECT TOP 1
                    a.OrgID
                    ,a.OrgType
                    ,o.organization_name
                    ,ss.status_name as subscription_name
                    ,ISNULL(a.MaxAreaAnalyzeablePerYear, 0) AS MaxAreaAnalyzeablePerYear
                    ,ISNULL(a.MaxAreaPerList, 0) AS MaxAreaPerList
                    ,ISNULL(a.max_locations_per_year, 0) AS max_locations_per_year
                    ,ISNULL(a.tokens_per_year, 0) AS tokens_per_year
                FROM AnalysisLimits a
                LEFT JOIN Organizations o ON a.OrgID = o.id
                LEFT JOIN SubscriptionStatuses ss ON ss.id = a.OrgType
                WHERE a.OrgType = @orgType
                ORDER BY a.update_time desc';

    IF @orgID IS NOT NULL
        SET @SQL = 'SELECT
                        COALESCE(a.OrgID, @orgID) as OrgID
                        ,a.OrgType
                        ,o.organization_name
                        ,NULL as subscription_name
                        ,ISNULL(SUM(a.MaxAreaAnalyzeablePerYear), 0) AS MaxAreaAnalyzeablePerYear
                        ,ISNULL(SUM(a.MaxAreaPerList), 0) AS MaxAreaPerList
                        ,ISNULL(SUM(a.max_locations_per_year), 0) AS max_locations_per_year
                        ,ISNULL(SUM(a.tokens_per_year), 0) AS tokens_per_year
                    FROM Organizations o
                    LEFT JOIN AnalysisLimits a ON a.OrgID = o.id
                    LEFT JOIN SubscriptionStatuses ss ON ss.id = o.subscription_status_id
                    WHERE o.id = @orgID
                    GROUP BY a.OrgID, a.OrgType, o.organization_name, ss.status_name';


-- debug
-- PRINT @SQL

EXEC sp_executesql @SQL,
                   N'@orgID INT, @orgType INT',
                   @orgType=@orgType, @orgID=@orgID;
END
`;

/**
 * Returns raw limit rows for an orgType with full update_time dates.
 * The carry-forward logic (mapping limits to contract year periods)
 * is done in the TypeScript layer using the org's renewal date.
 */
export const getAnalysisLimitsByOrgType = `
SELECT
    OrgType,
    ISNULL(MaxAreaAnalyzeablePerYear, 0) AS MaxAreaAnalyzeablePerYear,
    ISNULL(MaxAreaPerList, 0) AS MaxAreaPerList,
    ISNULL(max_locations_per_year, 0) AS max_locations_per_year,
    ISNULL(tokens_per_year, 0) AS tokens_per_year,
    update_time
FROM AnalysisLimits
WHERE OrgType = @orgType
ORDER BY update_time ASC
`;

export interface AnalysisLimit {
  MaxAreaAnalyzeablePerYear: number;
  MaxAreaPerList?: number;
  OrgID?: number;
  OrgType?: number;
  organization_name?: string;
  subscription_name?: string;
  max_locations_per_year?: number;
  tokens_per_year?: number;
  update_time?: string;
  year?: number;
}
