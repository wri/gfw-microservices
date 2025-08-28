/**
 * [dbo].[uspGetListsDashboardTimestamp]
	@timestamp DATETIME2 NULL
 * @list_id SMALLINT NULL
 */
export const getListsDashboardTimestamp = `
BEGIN

	IF @list_id IS NULL
		SELECT id
		FROM dbo.Lists WHERE dashboard_last_submit = @timestamp

	ELSE
		SELECT dashboard_last_results
		FROM dbo.Lists WHERE id = @list_id

END
`;
