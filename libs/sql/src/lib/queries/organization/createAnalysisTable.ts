/**
 * @param list_analysis_table_name NVARCHAR(150)
 */
export const createAnalysisTable = `
BEGIN
	DECLARE @TEMPLATE NVARCHAR(MAX)
	DECLARE @SQL NVARCHAR(MAX)

	SET @TEMPLATE = '
		CREATE TABLE [{TABLE_NAME}]
		(
			[location_id] INT UNIQUE,
			[location_status_id] INT NOT NULL,

			[tree_cover_loss_total_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_peat_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_intact_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_protected_areas_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_sea_landcover_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_landcover_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_soy_yearly] NVARCHAR(2000) DEFAULT ''{}'',
			[tree_cover_loss_idn_legal_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_idn_forest_moratorium_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_wdpa_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_prodes_primary_forest_yearly] NVARCHAR(MAX) DEFAULT ''{}'',
			[tree_cover_loss_brazil_biomes_yearly] NVARCHAR(MAX) DEFAULT ''{}'',

			[tree_cover_extent_total] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_primary_forest] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_protected_areas] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_peat] DECIMAL(18,6) DEFAULT 0.000000,
			[tree_cover_extent_intact_forest] DECIMAL(18, 6) DEFAULT 0.00000,

			[natural_habitat_primary] DECIMAL(18, 6) DEFAULT 0.00000,
			[natural_habitat_intact_forest] DECIMAL(18,6) DEFAULT 0.000000,
			[natural_habitat_global_land_cover] NVARCHAR(MAX) DEFAULT ''{}'',

			[total_area] DECIMAL(18, 6) DEFAULT 0.00000,
			[protected_areas_area] DECIMAL(18,6) DEFAULT 0.000000,
			[critical_habitat_alliance_zero] DECIMAL(18,6) DEFAULT 0.000000,
			[indigenous_people_land_rights] DECIMAL(18,6) DEFAULT 0.000000,
			[peat_area] DECIMAL(18,6) DEFAULT 0.000000,
			[fires_counts_monthly] NVARCHAR(MAX) DEFAULT '''',
			[soy_total_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[soy_pre2001_nonforest_area] DECIMAL(18, 6)  DEFAULT 0.00000,
			[brazil_biomes] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_legal_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[sea_landcover_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_landcover_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[idn_forest_moratorium_area] DECIMAL(18, 6) DEFAULT 0.00000,

			[south_america_presence] NVARCHAR(50) DEFAULT ''false'',
			[legal_amazon_presence] NVARCHAR(50) DEFAULT ''false'',
			[brazil_biomes_presence] NVARCHAR(50) DEFAULT ''false'',
			[cerrado_biome_presence] NVARCHAR(50) DEFAULT ''false'',
			[southeast_asia_presence] NVARCHAR(50) DEFAULT ''false'',
			[indonesia_presence] NVARCHAR(50) DEFAULT ''false'',

			[commodity_threat_deforestation_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_peat_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_protected_areas_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_fires_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_overall_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_forest_extent_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_peat_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_protected_areas_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_overall_level] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_value_forest_extent] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_peat] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_protected_areas] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_mill_priority_level] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_mill_priority_score] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_value_overall_score] NVARCHAR(MAX) DEFAULT ''{}'',

			[commodity_threat_deforestation] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_peat] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_protected_areas] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_fires] NVARCHAR(MAX) DEFAULT ''{}'',
			[commodity_threat_overall_score] NVARCHAR(MAX) DEFAULT ''{}'',
			[dissolved_data_location_info] NVARCHAR(300) DEFAULT ''{}'',
			[arg_otbn_area] NVARCHAR(MAX) DEFAULT ''{}'',
			[protected_areas_by_category_area] NVARCHAR(MAX) NOT NULL DEFAULT ''{}'',
			[landmark_by_category_area] NVARCHAR(MAX) NOT NULL DEFAULT ''{}'',
			[country_specific_deforestation_yearly] NVARCHAR(MAX),
			[country_specific_deforestation_wdpa_yearly] NVARCHAR(MAX),
			[country_specific_deforestation_landmark_yearly] NVARCHAR(MAX),
			[country_specific_deforestation_classified_region_yearly] NVARCHAR(MAX),
			[tree_cover_loss_by_country_yearly] NVARCHAR(MAX),
			[tree_cover_loss_by_country_wdpa_yearly] NVARCHAR(MAX),
			[tree_cover_loss_by_country_landmark_yearly] NVARCHAR(MAX),
			[country_area] NVARCHAR(MAX),
			[classified_region_area] NVARCHAR(MAX),
			[tree_cover_loss_by_country_classified_region_yearly] NVARCHAR(MAX),

			[location_error] NVARCHAR(MAX),

			INDEX [IX_{TABLE_NAME}_2] NONCLUSTERED(location_status_id)
		)
	'

	SET @SQL = REPLACE(@TEMPLATE, '{TABLE_NAME}', @list_analysis_table_name)
	EXEC sp_executesql @SQL
END`;
