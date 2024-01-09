/**
 * This SP is used to get the analysis usage for an organization or a list
 * The command requires the following parameters:
 * @organizationId INT,
 * @startDate DATETIME,
 * @endDate DATETIME
 */
export const getOrganizationUsersAnalysisUsage = `
-- Temporary table to store the results
CREATE TABLE #AggregatedUsersAnalysisUsage (
  user_id INT,
  total_area_analyzed FLOAT,
  max_area_analyzed FLOAT,
  total_lists_analyzed INT,
  total_locations_analyzed INT
);

-- Cursor to get organization db_name
DECLARE @DBName NVARCHAR(255);
DECLARE @OrgId INT;
DECLARE @orgCursor CURSOR;

BEGIN
  SET @orgCursor = CURSOR FOR
  SELECT org.organization_db FROM Organizations org JOIN 
    Statuses st ON st.id = org.organization_status_id
  WHERE st.status_name = 'active' AND 
    org.id = @organizationId;
END

OPEN @orgCursor;
FETCH NEXT FROM @orgCursor INTO @DBName

-- Fetch from cursor
WHILE @@FETCH_STATUS = 0
BEGIN
  -- Construct the dynamic query using the organization database
  DECLARE @SQLQuery NVARCHAR(MAX);
  SET @SQLQuery = '
    INSERT INTO #AggregatedUsersAnalysisUsage
      SELECT
        user_id,
        ISNULL(SUM(area_analyzed_list_ha), 0) as total_area_analyzed,
        ISNULL(MAX(area_analyzed_list_ha), 0) as max_area_analyzed,
        COUNT(DISTINCT list_id) as total_lists_analyzed,
        ISNULL(SUM(locations_analyzed), 0) as total_locations_analyzed
      FROM
        [' + @DBName + '].[dbo].[ListsProcessing]
      WHERE
        analysis_end_time >= @startDate
      AND analysis_end_time <= @endDate
      GROUP BY
        user_id;
  ';

  -- Execute the dynamic query
  EXEC sp_executesql @SQLQuery, N'@startDate DATETIME, @endDate DATETIME', @startDate, @endDate;

  -- Fetch the next organization
  FETCH NEXT FROM @orgCursor INTO @DBName;
END;

CLOSE @orgCursor;
DEALLOCATE @orgCursor;

-- Return the result
SELECT
    user_id,
    total_area_analyzed,
    max_area_analyzed,
    total_lists_analyzed,
    total_locations_analyzed
FROM
    #AggregatedUsersAnalysisUsage;

-- Drop the temporary table
DROP TABLE #AggregatedUsersAnalysisUsage;
`;

export interface OrganizationUsersAnalysisUsage {
  total_area_analyzed: number;
  max_area_analyzed: number;
  number_of_lists_analyzed: number;
  locations_analyzed: number | null;
  user_id: number;
}
