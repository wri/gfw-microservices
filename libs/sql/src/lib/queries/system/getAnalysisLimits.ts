/**
 * This query is used to get the analysis limit considering an organization id or type.
 * The command requires the following parameters:
 * @orgID INT,
 * @orgType INT,
 */

export const getAnalysisLimits = `
DECLARE @SQL NVARCHAR(MAX)
DECLARE @Filters NVARCHAR(MAX) = ''

BEGIN
    SET @SQL = 'SELECT a.MaxAreaAnalyzeablePerYear, a.MaxAreaPerList, a.OrgID, a.OrgType, o.organization_name, ss.status_name FROM AnalysisLimits a LEFT JOIN Organizations o ON a.OrgID = o.id LEFT JOIN SubscriptionStatuses ss ON ss.id = a.OrgType WHERE 1=1';

    IF @orgID IS NOT NULL
        SET @Filters = + @Filters + ' AND a.OrgID = @orgID'

    IF @orgType IS NOT NULL
        SET @Filters = + @Filters + ' AND a.OrgType = @orgType'


    SET @SQL = @SQL + @Filters

    EXEC sp_executesql @SQL,
        			   N'@orgID INT, @orgType INT',
                       @orgType=@orgType, @orgID=@orgID

END
`;

export interface AnalysisLimit {
  MaxAreaAnalyzeablePerYear: number;
  MaxAreaPerList: number;
  OrgID?: number;
  OrgType?: number;
  organization_name?: string;
  status_name?: string;
}
