/**
 * S BELOW ARE FOR RE-RUNNING LISTS

CREATE
 */
export const insertNewLocationToAnalysisTable = `
DECLARE @analyisTableName NVARCHAR(150)
DECLARE @listTableName NVARCHAR(150)

SET @analyisTableName = (
	SELECT list_analysis_table_name
	FROM Lists
	WHERE id = @list_id
)
SET @listTableName = (
	SELECT list_table_name
	FROM Lists
	WHERE id = @list_id
)

-- Insert New Rows into Analysis Table.
DECLARE @TEMPLATE NVARCHAR(1000)
DECLARE @SQL NVARCHAR(1000)
SET @TEMPLATE = '
	INSERT INTO [{ANALYSIS_TABLE}](location_id, location_status_id)
		SELECT location_id, 1
		FROM [{LIST_TABLE}]
		WHERE location_id > 0
'
SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analyisTableName)
SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @listTableName)
EXEC sp_executesql @SQL
`;
