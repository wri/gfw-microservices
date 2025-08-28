/**
 * [dbo].[uspImportFromDynamoDB]
					@json NVARCHAR(MAX)
 * @analysis_table NVARCHAR(150)
 * @append_locations BIT
 */
export const importFromDynamoDB = `
DECLARE @TEMPLATE NVARCHAR(MAX)
DECLARE @APPEND_LOCATION_TEMPLATE NVARCHAR(MAX)
DECLARE @SQL NVARCHAR(MAX)

SET @json = REPLACE(REPLACE(@json, CHAR(13), ''), CHAR(10), '')

DROP TABLE IF EXISTS [temp_analysis_table]
DROP TABLE IF EXISTS [temp_merged_analysis_table]

SELECT
	[location_id] AS [location_id],
	ISNULL([tree_cover_loss_total_yearly], '{}') AS [tree_cover_loss_total_yearly],
	ISNULL([tree_cover_loss_primary_forest_yearly], '{}') AS [tree_cover_loss_primary_forest_yearly],
	ISNULL([tree_cover_loss_peat_yearly], '{}') AS [tree_cover_loss_peat_yearly],
	ISNULL([tree_cover_loss_intact_forest_yearly], '{}') AS [tree_cover_loss_intact_forest_yearly],
	ISNULL([tree_cover_loss_protected_areas_yearly], '{}') AS [tree_cover_loss_protected_areas_yearly],
	ISNULL([tree_cover_loss_sea_landcover_yearly], '{}') AS [tree_cover_loss_sea_landcover_yearly],
	ISNULL([tree_cover_loss_idn_landcover_yearly], '{}') AS [tree_cover_loss_idn_landcover_yearly],
	ISNULL([tree_cover_loss_idn_primary_forest_yearly], '{}') AS [tree_cover_loss_idn_primary_forest_yearly],
	ISNULL([tree_cover_loss_soy_yearly], '{}') [tree_cover_loss_soy_yearly],
	ISNULL([tree_cover_loss_idn_legal_yearly], '{}') AS [tree_cover_loss_idn_legal_yearly],
	ISNULL([tree_cover_loss_idn_forest_moratorium_yearly], '{}') AS [tree_cover_loss_idn_forest_moratorium_yearly],
	ISNULL([tree_cover_loss_prodes_yearly], '{}') AS [tree_cover_loss_prodes_yearly],
	ISNULL([tree_cover_loss_prodes_wdpa_yearly], '{}') AS [tree_cover_loss_prodes_wdpa_yearly],
	ISNULL([tree_cover_loss_prodes_primary_forest_yearly], '{}') AS [tree_cover_loss_prodes_primary_forest_yearly],
	ISNULL([tree_cover_loss_brazil_biomes_yearly], '{}') AS [tree_cover_loss_brazil_biomes_yearly],
	ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_total] AS FLOAT)), 0.000000) AS [tree_cover_extent_total],
	ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_primary_forest] AS FLOAT)), 0.000000) AS [tree_cover_extent_primary_forest],
	ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_protected_areas] AS FLOAT)), 0.000000) AS [tree_cover_extent_protected_areas],
	ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_peat] AS FLOAT)), 0.000000) AS [tree_cover_extent_peat],
	ISNULL(CONVERT(decimal(18,6), CAST([tree_cover_extent_intact_forest] AS FLOAT)), 0.000000) AS [tree_cover_extent_intact_forest],
	ISNULL(CONVERT(decimal(18,6), CAST([natural_habitat_primary] AS FLOAT)), 0.000000) AS [natural_habitat_primary],
	ISNULL(CONVERT(decimal(18,6), CAST([natural_habitat_intact_forest] AS FLOAT)), 0.000000) AS [natural_habitat_intact_forest],
	ISNULL([natural_habitat_global_land_cover], '{}') AS [natural_habitat_global_land_cover],
	ISNULL(CONVERT(decimal(18,6), CAST([total_area] AS FLOAT)), 0.000000) AS [total_area],
	ISNULL(CONVERT(decimal(18,6), CAST([protected_areas_area] AS FLOAT)), 0.000000) AS [protected_areas_area],
	ISNULL(CONVERT(decimal(18,6), CAST([critical_habitat_alliance_zero] AS FLOAT)), 0.000000) AS [critical_habitat_alliance_zero],
	ISNULL(CONVERT(decimal(18,6), CAST([indigenous_people_land_rights] AS FLOAT)), 0.000000) AS [indigenous_people_land_rights],
	ISNULL(CONVERT(decimal(18,6), CAST([peat_area] AS FLOAT)), 0.000000) AS [peat_area],
	ISNULL([fires_counts_monthly], '{}') AS [fires_counts_monthly],
	ISNULL([soy_total_area], '{}') AS [soy_total_area],
	ISNULL(CONVERT(decimal(18,6), CAST([soy_pre2001_nonforest_area] AS FLOAT)), 0.000000) AS [soy_pre2001_nonforest_area],
	ISNULL([brazil_biomes], '{}') AS [brazil_biomes],
	ISNULL([idn_legal_area], '{}') AS [idn_legal_area],
	ISNULL([sea_landcover_area], '{}') AS [sea_landcover_area],
	ISNULL([idn_landcover_area], '{}') AS [idn_landcover_area],
	ISNULL(CONVERT(decimal(18,6), CAST([idn_forest_moratorium_area] AS FLOAT)), 0.000000) AS [idn_forest_moratorium_area],
	ISNULL([south_america_presence], 'false') AS [south_america_presence],
	ISNULL([legal_amazon_presence], 'false') AS [legal_amazon_presence],
	ISNULL([brazil_biomes_presence], 'false') AS [brazil_biomes_presence],
	ISNULL([cerrado_biome_presence], 'false') AS [cerrado_biome_presence],
	ISNULL([southeast_asia_presence], 'false') AS [southeast_asia_presence],
	ISNULL([indonesia_presence], 'false') AS [indonesia_presence],
	ISNULL([commodity_threat_deforestation_level], '{}') AS [commodity_threat_deforestation_level],
	ISNULL([commodity_threat_peat_level], '{}') AS [commodity_threat_peat_level],
	ISNULL([commodity_threat_protected_areas_level], '{}') AS [commodity_threat_protected_areas_level],
	ISNULL([commodity_threat_fires_level], '{}') AS [commodity_threat_fires_level],
	ISNULL([commodity_threat_overall_level], '{}') AS [commodity_threat_overall_level],
	ISNULL([commodity_threat_overall_score], '{}') AS [commodity_threat_overall_score],
	ISNULL([commodity_value_forest_extent_level], '{}') AS [commodity_value_forest_extent_level],
	ISNULL([commodity_value_peat_level], '{}') AS [commodity_value_peat_level],
	ISNULL([commodity_value_protected_areas_level], '{}') AS [commodity_value_protected_areas_level],
	ISNULL([commodity_value_overall_level], '{}') AS [commodity_value_overall_level],
	ISNULL([commodity_value_overall_score], '{}') AS [commodity_value_overall_score],
	ISNULL([commodity_value_forest_extent], '{}') AS [commodity_value_forest_extent],
	ISNULL([commodity_value_peat], '{}') AS [commodity_value_peat],
	ISNULL([commodity_value_protected_areas], '{}') AS [commodity_value_protected_areas],
	ISNULL([commodity_mill_priority_level], '{}') AS [commodity_mill_priority_level],
	ISNULL([commodity_mill_priority_score], '{}') AS [commodity_mill_priority_score],
	ISNULL([commodity_threat_deforestation], '{}') AS [commodity_threat_deforestation],
	ISNULL([commodity_threat_peat], '{}') AS [commodity_threat_peat],
	ISNULL([commodity_threat_protected_areas], '{}') AS [commodity_threat_protected_areas],
	ISNULL([commodity_threat_fires], '{}') AS [commodity_threat_fires],
	ISNULL([dissolved_geom_object_key], '{}') AS [dissolved_geom_object_key],
							ISNULL([tree_cover_loss_arg_otbn_yearly], '{}') AS [tree_cover_loss_arg_otbn_yearly],
							ISNULL([arg_otbn_area], '{}') AS [arg_otbn_area],
							ISNULL([argentina_presence], 'false') AS [argentina_presence]
INTO dbo.[temp_analysis_table]
FROM OPENJSON (@json)
WITH(
	[location_id] [int],
	[tree_cover_loss_total_yearly] [nvarchar](max),
	[tree_cover_loss_primary_forest_yearly] [nvarchar](max),
	[tree_cover_loss_peat_yearly] [nvarchar](max),
	[tree_cover_loss_intact_forest_yearly] [nvarchar](max),
	[tree_cover_loss_protected_areas_yearly] [nvarchar](max),
	[tree_cover_loss_sea_landcover_yearly] [nvarchar](max),
	[tree_cover_loss_idn_landcover_yearly] [nvarchar](max),
	[tree_cover_loss_idn_primary_forest_yearly] [nvarchar](max),
	[tree_cover_loss_soy_yearly] [nvarchar](2000),
	[tree_cover_loss_idn_legal_yearly] [nvarchar](max),
	[tree_cover_loss_idn_forest_moratorium_yearly] [nvarchar](max),
	[tree_cover_loss_prodes_yearly] [nvarchar](max),
	[tree_cover_loss_prodes_wdpa_yearly] [nvarchar](max),
	[tree_cover_loss_prodes_primary_forest_yearly] [nvarchar](max),
	[tree_cover_loss_brazil_biomes_yearly] [nvarchar](max),
	[tree_cover_extent_total] [nvarchar](max),
	[tree_cover_extent_primary_forest] [nvarchar](max),
	[tree_cover_extent_protected_areas] [nvarchar](max),
	[tree_cover_extent_peat] [nvarchar](max),
	[tree_cover_extent_intact_forest] [nvarchar](max),
	[natural_habitat_primary] [nvarchar](max),
	[natural_habitat_intact_forest] [nvarchar](max),
	[natural_habitat_global_land_cover] [nvarchar](max),
	[total_area] [nvarchar](max),
	[protected_areas_area] [nvarchar](max),
	[critical_habitat_alliance_zero] [nvarchar](max),
	[indigenous_people_land_rights] [nvarchar](max),
	[peat_area] [nvarchar](max),
	[fires_counts_monthly] [nvarchar](max),
	[soy_total_area] [nvarchar](max),
	[soy_pre2001_nonforest_area] [nvarchar](max),
	[brazil_biomes] [nvarchar](max),
	[idn_legal_area] [nvarchar](max),
	[sea_landcover_area] [nvarchar](max),
	[idn_landcover_area] [nvarchar](max),
	[idn_forest_moratorium_area] [nvarchar](max),
	[south_america_presence] [nvarchar](50),
	[legal_amazon_presence] [nvarchar](50),
	[brazil_biomes_presence] [nvarchar](50),
	[cerrado_biome_presence] [nvarchar](50),
	[southeast_asia_presence] [nvarchar](50),
	[indonesia_presence] [nvarchar](50),
	[commodity_threat_deforestation_level] [nvarchar](max),
	[commodity_threat_peat_level] [nvarchar](max),
	[commodity_threat_protected_areas_level] [nvarchar](max),
	[commodity_threat_fires_level] [nvarchar](max),
	[commodity_threat_overall_level] [nvarchar](max),
	[commodity_threat_overall_score] [nvarchar](max),
	[commodity_value_forest_extent_level] [nvarchar](max),
	[commodity_value_peat_level] [nvarchar](max),
	[commodity_value_protected_areas_level] [nvarchar](max),
	[commodity_value_overall_level] [nvarchar](max),
	[commodity_value_overall_score] [nvarchar](max),
	[commodity_value_forest_extent] [nvarchar](max),
	[commodity_value_peat] [nvarchar](max),
	[commodity_value_protected_areas] [nvarchar](max),
	[commodity_mill_priority_level] [nvarchar](max),
	[commodity_mill_priority_score] [nvarchar](max),
	[commodity_threat_deforestation] [nvarchar](max),
	[commodity_threat_peat] [nvarchar](max),
	[commodity_threat_protected_areas] [nvarchar](max),
	[commodity_threat_fires] [nvarchar](max),
	[dissolved_geom_object_key] [nvarchar](300),
							[tree_cover_loss_arg_otbn_yearly] [nvarchar](max),
							[arg_otbn_area] [nvarchar](max),
							[argentina_presence] [nvarchar](50)

)

-- Create a temp table and join both the dynamodb data with the analysis table, making sure to include the location_status_id
-- Cleaning up and converting the JSON analysis data into the analysis table
SET @TEMPLATE = '
	SELECT
		L.[location_id],
		L.[location_status_id],
		D.[tree_cover_loss_total_yearly],
		D.[tree_cover_loss_primary_forest_yearly],
		D.[tree_cover_loss_peat_yearly],
		D.[tree_cover_loss_intact_forest_yearly],
		D.[tree_cover_loss_protected_areas_yearly],
		D.[tree_cover_loss_sea_landcover_yearly],
		D.[tree_cover_loss_idn_landcover_yearly],
		D.[tree_cover_loss_idn_primary_forest_yearly],
		D.[tree_cover_loss_soy_yearly],
		D.[tree_cover_loss_idn_legal_yearly],
		D.[tree_cover_loss_idn_forest_moratorium_yearly],
		D.[tree_cover_loss_prodes_yearly],
		D.[tree_cover_loss_prodes_wdpa_yearly],
		D.[tree_cover_loss_prodes_primary_forest_yearly],
		D.[tree_cover_loss_brazil_biomes_yearly],
		D.[tree_cover_extent_total],
		D.[tree_cover_extent_primary_forest],
		D.[tree_cover_extent_protected_areas],
		D.[tree_cover_extent_peat],
		D.[tree_cover_extent_intact_forest],
		D.[natural_habitat_primary],
		D.[natural_habitat_intact_forest],
		D.[natural_habitat_global_land_cover],
		D.[total_area],
		D.[protected_areas_area],
		D.[critical_habitat_alliance_zero],
		D.[indigenous_people_land_rights],
		D.[peat_area],
		D.[fires_counts_monthly],
		D.[soy_total_area],
		D.[soy_pre2001_nonforest_area],
		D.[brazil_biomes],
		D.[idn_legal_area],
		D.[sea_landcover_area],
		D.[idn_landcover_area],
		D.[idn_forest_moratorium_area],
		D.[south_america_presence],
		D.[legal_amazon_presence],
		D.[brazil_biomes_presence],
		D.[cerrado_biome_presence],
		D.[southeast_asia_presence],
		D.[indonesia_presence],
		D.[commodity_threat_deforestation_level],
		D.[commodity_threat_peat_level],
		D.[commodity_threat_protected_areas_level],
		D.[commodity_threat_fires_level],
		D.[commodity_threat_overall_level],
		D.[commodity_threat_overall_score],
		D.[commodity_value_forest_extent_level],
		D.[commodity_value_peat_level],
		D.[commodity_value_protected_areas_level],
		D.[commodity_value_overall_level],
		D.[commodity_value_overall_score],
		D.[commodity_value_forest_extent],
		D.[commodity_value_peat],
		D.[commodity_value_protected_areas],
		D.[commodity_mill_priority_level],
		D.[commodity_mill_priority_score],
		D.[commodity_threat_deforestation],
		D.[commodity_threat_peat],
		D.[commodity_threat_protected_areas],
		D.[commodity_threat_fires],
		D.[dissolved_geom_object_key],
									D.[tree_cover_loss_arg_otbn_yearly],
									D.[arg_otbn_area],
									D.[argentina_presence]
	INTO dbo.[temp_merged_analysis_table]
	FROM [temp_analysis_table] AS D 
	RIGHT JOIN [{ANALYSIS_TABLE}] AS L ON D.location_id = L.location_id ORDER BY L.location_id ASC

	TRUNCATE TABLE [{ANALYSIS_TABLE}]

	-- Insert back into the analysis table
	INSERT INTO [{ANALYSIS_TABLE}]
	SELECT * FROM [temp_merged_analysis_table]

	DROP TABLE IF EXISTS [temp_analysis_table]

	SELECT COUNT(*) AS analysesCount FROM [{ANALYSIS_TABLE}]
'

-- Add location template
SET @APPEND_LOCATION_TEMPLATE = '
	SELECT
		L.[location_id],
		L.[location_status_id],
		D.[tree_cover_loss_total_yearly],
		D.[tree_cover_loss_primary_forest_yearly],
		D.[tree_cover_loss_peat_yearly],
		D.[tree_cover_loss_intact_forest_yearly],
		D.[tree_cover_loss_protected_areas_yearly],
		D.[tree_cover_loss_sea_landcover_yearly],
		D.[tree_cover_loss_idn_landcover_yearly],
		D.[tree_cover_loss_idn_primary_forest_yearly],
		D.[tree_cover_loss_soy_yearly],
		D.[tree_cover_loss_idn_legal_yearly],
		D.[tree_cover_loss_idn_forest_moratorium_yearly],
		D.[tree_cover_loss_prodes_yearly],
		D.[tree_cover_loss_prodes_wdpa_yearly],
		D.[tree_cover_loss_prodes_primary_forest_yearly],
		D.[tree_cover_loss_brazil_biomes_yearly],
		D.[tree_cover_extent_total],
		D.[tree_cover_extent_primary_forest],
		D.[tree_cover_extent_protected_areas],
		D.[tree_cover_extent_peat],
		D.[tree_cover_extent_intact_forest],
		D.[natural_habitat_primary],
		D.[natural_habitat_intact_forest],
		D.[natural_habitat_global_land_cover],
		D.[total_area],
		D.[protected_areas_area],
		D.[critical_habitat_alliance_zero],
		D.[indigenous_people_land_rights],
		D.[peat_area],
		D.[fires_counts_monthly],
		D.[soy_total_area],
		D.[soy_pre2001_nonforest_area],
		D.[brazil_biomes],
		D.[idn_legal_area],
		D.[sea_landcover_area],
		D.[idn_landcover_area],
		D.[idn_forest_moratorium_area],
		D.[south_america_presence],
		D.[legal_amazon_presence],
		D.[brazil_biomes_presence],
		D.[cerrado_biome_presence],
		D.[southeast_asia_presence],
		D.[indonesia_presence],
		D.[commodity_threat_deforestation_level],
		D.[commodity_threat_peat_level],
		D.[commodity_threat_protected_areas_level],
		D.[commodity_threat_fires_level],
		D.[commodity_threat_overall_level],
		D.[commodity_threat_overall_score],
		D.[commodity_value_forest_extent_level],
		D.[commodity_value_peat_level],
		D.[commodity_value_protected_areas_level],
		D.[commodity_value_overall_level],
		D.[commodity_value_overall_score],
		D.[commodity_value_forest_extent],
		D.[commodity_value_peat],
		D.[commodity_value_protected_areas],
		D.[commodity_mill_priority_level],
		D.[commodity_mill_priority_score],
		D.[commodity_threat_deforestation],
		D.[commodity_threat_peat],
		D.[commodity_threat_protected_areas],
		D.[commodity_threat_fires],
		D.[dissolved_geom_object_key],
									D.[tree_cover_loss_arg_otbn_yearly],
									D.[arg_otbn_area],
									D.[argentina_presence]
	INTO dbo.[temp_merged_analysis_table]
	FROM [temp_analysis_table] AS D 
	INNER JOIN [{ANALYSIS_TABLE}] AS L ON D.location_id = L.location_id ORDER BY L.location_id ASC

	-- Deleting new locations from existing list
	DELETE FROM [{ANALYSIS_TABLE}] WHERE location_id IN (
		SELECT [location_id]
		FROM dbo.[temp_merged_analysis_table]
	)

	-- Append the new locations to the existing list
	INSERT INTO [{ANALYSIS_TABLE}]
	SELECT * FROM 
	dbo.[temp_merged_analysis_table]

	-- Dropping the temporary analysis table
	DROP TABLE IF EXISTS [temp_analysis_table]

	SELECT COUNT(*) AS analysesCount FROM [{ANALYSIS_TABLE}]
'

IF @append_locations = 0
BEGIN
	SET @SQL = REPLACE(@TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table)
END
ELSE
BEGIN
	SET @SQL = REPLACE(@APPEND_LOCATION_TEMPLATE, '{ANALYSIS_TABLE}', @analysis_table)
END
EXEC sp_executesql @SQL
`;
