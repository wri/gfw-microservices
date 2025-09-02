/**
 * [dbo].[uspUpsertAnalysesDashboard]
	@list_id INT
 * @DashboardUpdates [TT-Analyses-Dashboard] READONLY
 */
export const upsertAnalysesDashboard = `
BEGIN

	ALTER INDEX ALL ON dbo.[Analyses-Dashboard] DISABLE;

	BEGIN TRANSACTION
	
		/* HANDLE DELETE, IF DISSOLVED LIST */
		DELETE TT
		FROM dbo.[Analyses-Dashboard] TT
		WHERE TT.list_id = @list_id AND location_id = -1;


		/* HANDLE UPDATE, IF EXISTS IN DASHBOARD TABLE */
		UPDATE TT
		SET TT.glad_alerts_coverage = SRC.glad_alerts_coverage
			, TT.glad_alerts_daily = SRC.glad_alerts_daily
			, TT.glad_alerts_weekly = SRC.glad_alerts_weekly
			, TT.glad_alerts_monthly = SRC.glad_alerts_monthly
			, TT.viirs_alerts_daily = SRC.viirs_alerts_daily
			, TT.tree_cover_extent_total = SRC.tree_cover_extent_total
		FROM dbo.[Analyses-Dashboard] AS TT	
		INNER JOIN @DashboardUpdates AS SRC
		ON TT.list_id = SRC.list_id
			AND TT.location_id = SRC.location_id
			AND TT.gadm_id = SRC.gadm_id
		WHERE TT.list_id = @list_id;


		/* HANDLE INSERT, IF NOT EXISTS IN DASHBOARD TABLE*/
		INSERT INTO dbo.[Analyses-Dashboard] (
			list_id, location_id, gadm_id, glad_alerts_coverage, glad_alerts_daily, glad_alerts_weekly, glad_alerts_monthly, viirs_alerts_daily, tree_cover_extent_total
		)
		SELECT list_id, location_id, gadm_id, glad_alerts_coverage, glad_alerts_daily, glad_alerts_weekly, glad_alerts_monthly, viirs_alerts_daily, tree_cover_extent_total
		FROM @DashboardUpdates SRC
		WHERE NOT EXISTS(
			SELECT *
			FROM dbo.[Analyses-Dashboard] AS TT
			WHERE TT.list_id = SRC.list_id 
				AND TT.location_id = SRC.location_id
				AND TT.gadm_id = SRC.gadm_id
		);

	COMMIT TRANSACTION	

	ALTER INDEX ALL ON dbo.[Analyses-Dashboard] REBUILD;

END
`;
