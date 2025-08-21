/**
 * [dbo].[uspGetDashboardInvestmentLocations]
                @listId INT
 */
export const getDashboardInvestmentLocations = `
DECLARE @listTable NVARCHAR(1000)
                DECLARE @analysisTable NVARCHAR(1000)
                SELECT @listTable = list_table_name, @analysisTable = list_analysis_table_name FROM Lists WHERE id = @listId

                DECLARE @SQL NVARCHAR(MAX)
                SET @SQL = '
                    SELECT {LIST_ID} AS list_id,LT.[location_id],LT.[Longitude],LT.[Latitude],LT.[Investment Name] AS [Location Name],LT.[Country],LT.[State],LT.[Sub State],LT.[gadmid],LT.Geometry.ToString() AS [WKTGeometry]
                    FROM [{LIST_TABLE}] LT JOIN [{ANALYSIS_TABLE}] AT
                    ON LT.location_id = AT.location_id
                    WHERE AT.location_status_id = 2
                '
                SET @SQL = REPLACE(@SQL, '{LIST_ID}', @listId)
                SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @listTable)
                SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE}', @analysisTable)
                EXEC sp_executesql @SQL
        
`;
