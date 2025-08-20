/**
 * [dbo].[uspGetDashboardDissolvedS3Location]
	@listId INT
 */
export const getDashboardDissolvedS3Location = `
SELECT dissolved_geom_object_key FROM Analyses WHERE list_id = @listId

`;
