/**
 * @list_name NVARCHAR(150)
 */
export const updateListAnalysisFailCount = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)
DECLARE @listID INT

--Get List ID for the list.
SELECT @listID = id FROM Lists WHERE list_name = @list_name

IF @listID IS NOT NULL
BEGIN
	-- Update Fail Count.
	SET @TEMPLATE = '
		BEGIN TRANSACTION
			UPDATE [Analyses]
			SET analysis_fail_count = analysis_fail_count + 1
			WHERE list_id = {LIST_ID}
		COMMIT TRANSACTION
	'

	SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listID)
	EXEC sp_executesql @SQL

	-- Return both success and fail counts.
	SET @TEMPLATE = '
		BEGIN TRANSACTION
			SELECT analysis_success_count, analysis_fail_count
			FROM [Analyses]
			WHERE list_id = {LIST_ID}
		COMMIT TRANSACTION
	'

	SET @SQL = REPLACE(@TEMPLATE, '{LIST_ID}', @listID)
	EXEC sp_executesql @SQL
END
`;
