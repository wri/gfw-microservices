/**
 * [dbo].[uspGetLocationsForBatchProcessing]
	@list_id INT
 */
export const getLocationsForBatchProcessing = `
DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE	@list_table NVARCHAR(150)
	DECLARE @analysis_table NVARCHAR(150)

	--Obtain the template id and location classification for the list.
	SELECT @list_table = list_table_name FROM dbo.Lists WHERE id = @list_id
	SELECT @analysis_table = list_analysis_table_name FROM dbo.Lists WHERE id = @list_id

	SET @TEMPLATE = '
		SELECT L.location_id, CONVERT(VARCHAR(MAX),L.Geometry.STAsBinary(), 2) AS [geom]
		, CASE 
			WHEN A.location_status_id  IS NULL OR A.total_area = 0 THEN ''New''
			ELSE ''Existing''
		END AS location_status
		FROM [{LIST_TABLE_NAME}] L
		LEFT JOIN(
			SELECT *
			FROM  [{ANALYSIS_TABLE_NAME}]
			WHERE location_status_id = 2
		) A ON A.location_id = L.location_id
	'
	SET @SQL = REPLACE(@TEMPLATE, '{LIST_TABLE_NAME}', @list_table)
	SET @SQL = REPLACE(@SQL, '{ANALYSIS_TABLE_NAME}', @analysis_table)
	EXEC sp_executesql @SQL
`;
