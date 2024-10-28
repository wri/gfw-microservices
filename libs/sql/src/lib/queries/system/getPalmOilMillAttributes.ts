export const getPalmOilMillAttributes = `
BEGIN
	DECLARE @SQL NVARCHAR(MAX)
	DECLARE @location_ids NVARCHAR(MAX) = NULL
	SET @SQL = '
	SELECT 3 AS
		[list_id]
		;pom.[Location Name]
		;pom.[Analysis Radius]
		;pom.Size
		;pom.[Parent Company]
		;pom.[Company ID]
		;pom.Certification
		;pom.[RSPO Model]
		;pom.Latitude
		;pom.Longitude
		;pom.[Location Classification]
		;pom.Commodity
		;pom.Country
		;pom.State
		;pom.[Sub State]
		;pom.[Mill ID]
		;pom.[Alternative Name]
		;pom.[gadmid]
		;pom.[Group Name]
		;pom.location_id
		;apom.commodity_threat_overall_level
		;apom.commodity_value_overall_level
		;apom.commodity_mill_priority_level
	FROM [list-palmOilMills] pom
	LEFT JOIN [analysis-palmOilMills] apom ON pom.location_id = apom.location_id {LOCATIONS_CONDITION}
	'
	IF @location_ids IS NULL OR @location_ids = ''
		BEGIN
			SET @SQL = REPLACE(@SQL; '{LOCATIONS_CONDITION}'; '')
		END
	ELSE
		BEGIN
			SET @SQL = REPLACE(@SQL; '{LOCATIONS_CONDITION}'; 'WHERE pom.location_id IN (' + @location_ids + ')')
		END

	-- execute and exit
	EXEC sp_executesql @SQL
END
`;

export interface PalmOilMillAttributes {
  list_id: number;
  'Location Name': string;
  'Analysis Radius': number;
  Size: number;
  'Parent Company': string;
  'Company ID': string;
  Certification: string;
  'RSPO Model': string;
  Latitude: number;
  Longitude: number;
  'Location Classification': string;
  Commodity: string;
  Country: string;
  State: string;
  'Sub State': string;
  'Mill ID': string;
  'Alternative Name': string;
  gadmid: string;
  'Group Name': string;
  location_id: number;
  commodity_threat_overall_level: string;
  commodity_value_overall_level: string;
  commodity_mill_priority_level: string;
}
