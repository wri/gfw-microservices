/**
 * [dbo].[uspUpdateListStatus]
	@list_table NVARCHAR(150)
 * @analysis_table NVARCHAR(150)
 * @dry_run BIT
 */
export const updateListStatus = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @TEMPLATE = '
	DECLARE @list_id INT
	DECLARE @listStatus INT
	DECLARE @pendingLocations INT
	DECLARE @listAnalysisStatus INT

	-- Set List Status to still processing (Default)
	SET @listStatus = 1

	-- Obtain the list id from the list table name.
	SELECT @list_id = id FROM Lists WHERE list_table_name = ''{LIST_TABLE}''

	-- Determine the number of locations still processing.
	SELECT @pendingLocations = COUNT(*) FROM [{ANALYSIS_TABLE}] WHERE location_status_id = 1

	-- Determine the status of the list level analysis.
	SELECT @listAnalysisStatus = status_id FROM Analyses WHERE list_id = @list_id

	-- If there are no pending locations and list level analysis is complete,
	-- set list Status to Available and return Available status.
	IF (@pendingLocations = 0 AND @listAnalysisStatus = 2)
		BEGIN
			IF ({DRY_RUN} = 0)
				BEGIN
					BEGIN TRANSACTION
						UPDATE Lists WITH (ROWLOCK) SET list_status_id = 2 WHERE id = @list_id
					COMMIT TRANSACTION
				END
			SET @listStatus = 2
		END
	-- If List Level Analysis failed, set list status to failed.
	ELSE IF (@pendingLocations = 0 AND @listAnalysisStatus = 3)
		BEGIN
			IF ({DRY_RUN} = 0)
				BEGIN
					BEGIN TRANSACTION
						UPDATE Lists WITH (ROWLOCK) SET list_status_id = 3 WHERE id = @list_id
					COMMIT TRANSACTION
				END
			SET @listStatus = 3
		END
	SELECT @listStatus AS ListStatus
	'
SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table)
SET @SQL = REPLACE(@SQL, '{DRY_RUN}', @dry_run)
SET @SQL = REPLACE(@SQL, '{LIST_TABLE}', @list_table)
EXEC sp_executesql @SQL
`;
