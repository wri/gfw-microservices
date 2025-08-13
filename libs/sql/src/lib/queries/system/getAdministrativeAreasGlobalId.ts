/**
 * @param global_ids NVARCHAR(MAX)
 */
export const getAdministrativeAreasGlobalId = `
IF @global_ids IS NULL OR @global_ids = ''
		BEGIN
			SELECT 1 AS [list_id],[Location Name],[Country],[State],[Sub State],[gadmid],[Latitude],[Longitude],[Location Classification],[Size],[location_id] FROM [list-administrativeAreas41]
			SELECT * FROM [analysis-administrativeAreas]
		END
	ELSE
		DECLARE @LIST_SQL NVARCHAR(MAX)
		SET @LIST_SQL = 'SELECT 1 AS [list_id],[Location Name],[Country],[State],[Sub State],[gadmid],[Latitude],[Longitude],[Location Classification],[Size],[location_id] FROM [list-administrativeAreas41] WHERE gadmid IN (''{GADMIDS}'')'
		SET @LIST_SQL = REPLACE(@LIST_SQL, '{GADMIDS}', @global_ids)
		EXEC sp_executesql @LIST_SQL
		DECLARE @ANALYSIS_SQL NVARCHAR(MAX)
		SET @ANALYSIS_SQL = 'SELECT * FROM [analysis-administrativeAreas] WHERE location_id IN (SELECT location_id FROM [list-administrativeAreas41] WHERE gadmid IN (''{GADMIDS}''))'
		SET @ANALYSIS_SQL = REPLACE(@ANALYSIS_SQL, '{GADMIDS}', @global_ids)
		EXEC sp_executesql @ANALYSIS_SQL
`;
