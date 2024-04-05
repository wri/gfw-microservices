/**
 * This query is used to get the analysis limit considering an organization id or type.
 * The command requires the following parameters:
 * @orgID INT,
 * @orgType INT,
 */

export const getAnalysisLimits = `BEGIN
	
DECLARE @SQL NVARCHAR(MAX)

    SET @SQL =  'SELECT  
                    a.OrgID
                    ,a.OrgType
                    ,o.organization_name
                    ,ss.status_name as subscription_name
                    ,ISNULL(SUM(a.MaxAreaAnalyzeablePerYear), 0) AS MaxAreaAnalyzeablePerYear
                    ,ISNULL(SUM(a.MaxAreaPerList), 0) AS MaxAreaPerList
                    ,ISNULL(SUM(a.max_locations_per_year), 0) AS max_locations_per_year 
                FROM AnalysisLimits a 
                LEFT JOIN Organizations o ON a.OrgID = o.id 
                LEFT JOIN SubscriptionStatuses ss ON ss.id = a.OrgType';

    IF @orgID IS NOT NULL
        SET @SQL = 'SELECT  
                        COALESCE(a.OrgID, @orgID) as OrgID
                        ,a.OrgType
                        ,o.organization_name
                        ,NULL as subscription_name
                        ,ISNULL(SUM(a.MaxAreaAnalyzeablePerYear), 0) AS MaxAreaAnalyzeablePerYear
                        ,ISNULL(SUM(a.MaxAreaPerList), 0) AS MaxAreaPerList
                        ,ISNULL(SUM(a.max_locations_per_year), 0) AS max_locations_per_year 
                    FROM Organizations o 
                    LEFT JOIN AnalysisLimits a ON a.OrgID = o.id
                    LEFT JOIN SubscriptionStatuses ss ON ss.id = o.subscription_status_id';



IF @orgID IS NOT NULL
BEGIN
    SET @SQL = @SQL + ' WHERE o.id = @orgID';
END
ELSE IF @orgType IS NOT NULL
BEGIN
    SET @SQL = @SQL + ' WHERE a.OrgType = @orgType';
END

SET @SQL = @SQL + ' GROUP BY a.OrgID, a.OrgType, o.organization_name, ss.status_name';

-- debug
-- PRINT @SQL

EXEC sp_executesql @SQL,
                   N'@orgID INT, @orgType INT',
                   @orgType=@orgType, @orgID=@orgID;
END
`;

export interface AnalysisLimit {
  MaxAreaAnalyzeablePerYear: number;
  MaxAreaPerList?: number;
  OrgID?: number;
  OrgType?: number;
  organization_name?: string;
  status_name?: string;
  max_locations_per_year?: number;
}
