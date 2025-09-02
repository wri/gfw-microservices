/**
 * [dbo].[uspSetDashboardTimestamp]
	@list_id_array NVARCHAR(MAX)
 * @column_name NVARCHAR(50)
 * @value DATETIME2
 */
export const setDashboardTimestamp = `
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)


	SET @TEMPLATE = '
		BEGIN TRANSACTION
			UPDATE [Lists]
			SET {COLUMN_NAME} = ''{VALUE}''
			WHERE id IN ({LIST_IDS})
		COMMIT TRANSACTION
	'

	SET @SQL = REPLACE(@TEMPLATE, '{COLUMN_NAME}', @column_name)
	SET @SQL = REPLACE(@SQL, '{VALUE}', @value)
	SET @SQL = REPLACE(@SQL, '{LIST_IDS}', @list_id_array)
	EXEC sp_executesql @SQL
END
`;
