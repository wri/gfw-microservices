/**
 * Query used to get the HA (hectares) limit per year for an organization or subscription type.
 * Returns the MaxAreaAnalyzeablePerYear from the most recent record where update_time <= current date.
 * Parameters: @orgID INT, @orgType INT
 */

export const getHALimitPerYear = `BEGIN

DECLARE @SQL NVARCHAR(MAX)

SET @SQL = 'SELECT TOP 1
                ISNULL(a.MaxAreaAnalyzeablePerYear, 0) AS max_ha_per_year
            FROM AnalysisLimits a
            LEFT JOIN Organizations o ON a.OrgID = o.id
            LEFT JOIN SubscriptionStatuses ss ON ss.id = a.OrgType
            WHERE a.update_time <= GETDATE()';

IF @orgID IS NOT NULL
BEGIN
    SET @SQL = @SQL + ' AND a.OrgID = @orgID';
END
ELSE IF @orgType IS NOT NULL
BEGIN
    SET @SQL = @SQL + ' AND a.OrgType = @orgType';
END

SET @SQL = @SQL + ' ORDER BY a.update_time DESC';

EXEC sp_executesql @SQL,
                   N'@orgID INT, @orgType INT',
                   @orgType=@orgType, @orgID=@orgID;
END
`;

export interface HALimitPerYearResult {
  max_ha_per_year: number;
}
