import os
import sqlalchemy as sal

# SQLALchemy connection string
sal_string = ""

# Directory to store data exported from DB
admin_areas_out_path = os.path.join("data", f"diced_admin_areas")

# Path to processed data
admin_analysis_data = r""

# Column names and data types
admin_areas_db_schema = {
    'id'                                                 : sal.INTEGER,
    'location_id'                                        : sal.INTEGER,
    'location_status_id'                                 : sal.INTEGER,
    'tree_cover_loss_total_yearly'                       : sal.NVARCHAR(length=None),
    'tree_cover_loss_primary_forest_yearly'              : sal.NVARCHAR(length=None),
    'tree_cover_loss_peat_yearly'                        : sal.NVARCHAR(length=None),
    'tree_cover_loss_intact_forest_yearly'               : sal.NVARCHAR(length=None),
    'tree_cover_loss_protected_areas_yearly'             : sal.NVARCHAR(length=None),
    'tree_cover_loss_sea_landcover_yearly'               : sal.NVARCHAR(length=None),
    'tree_cover_loss_idn_landcover_yearly'               : sal.NVARCHAR(length=None),
    'tree_cover_loss_idn_primary_forest_yearly'          : sal.NVARCHAR(length=None),
    'tree_cover_loss_soy_yearly'                         : sal.NVARCHAR(length=None),
    'tree_cover_loss_idn_legal_yearly'                   : sal.NVARCHAR(length=None),
    'tree_cover_loss_idn_forest_moratorium_yearly'       : sal.NVARCHAR(length=None),
    'tree_cover_loss_prodes_yearly'                      : sal.NVARCHAR(length=None),
    'tree_cover_loss_prodes_wdpa_yearly'                 : sal.NVARCHAR(length=None),
    'tree_cover_loss_prodes_primary_forest_yearly'       : sal.NVARCHAR(length=None),
    'tree_cover_loss_brazil_biomes_yearly'               : sal.NVARCHAR(length=None),
    'tree_cover_extent_total'                            : sal.DECIMAL(18, 6),
    'tree_cover_extent_primary_forest'                   : sal.DECIMAL(18, 6),
    'tree_cover_extent_protected_areas'                  : sal.DECIMAL(18, 6),
    'tree_cover_extent_peat'                             : sal.DECIMAL(18, 6),
    'tree_cover_extent_intact_forest'                    : sal.DECIMAL(18, 6),
    'natural_habitat_primary'                            : sal.DECIMAL(18, 6),
    'natural_habitat_intact_forest'                      : sal.DECIMAL(18, 6),
    'natural_habitat_global_land_cover'                  : sal.NVARCHAR(length=None),
    'total_area'                                         : sal.DECIMAL(18, 6),
    'protected_areas_area'                               : sal.DECIMAL(18, 6),
    'critical_habitat_alliance_zero'                     : sal.DECIMAL(18, 6),
    'indigenous_people_land_rights'                      : sal.DECIMAL(18, 6),
    'peat_area'                                          : sal.DECIMAL(18, 6),
    'fires_counts_monthly'                               : sal.NVARCHAR(length=None),
    'soy_total_area'                                     : sal.NVARCHAR(length=None),
    'soy_pre2001_nonforest_area'                         : sal.DECIMAL(18, 6),
    'brazil_biomes'                                      : sal.NVARCHAR(length=None),
    'idn_legal_area'                                     : sal.NVARCHAR(length=None),
    'sea_landcover_area'                                 : sal.NVARCHAR(length=None),
    'idn_landcover_area'                                 : sal.NVARCHAR(length=None),
    'idn_forest_moratorium_area'                         : sal.DECIMAL(18, 6),
    'south_america_presence'                             : sal.NVARCHAR(length=None),
    'legal_amazon_presence'                              : sal.NVARCHAR(length=None),
    'brazil_biomes_presence'                             : sal.NVARCHAR(length=None),
    'cerrado_biome_presence'                             : sal.NVARCHAR(length=None),
    'southeast_asia_presence'                            : sal.NVARCHAR(length=None),
    'indonesia_presence'                                 : sal.NVARCHAR(length=None),
    'commodity_threat_deforestation_level'               : sal.NVARCHAR(length=None),
    'commodity_threat_peat_level'                        : sal.NVARCHAR(length=None),
    'commodity_threat_protected_areas_level'             : sal.NVARCHAR(length=None),
    'commodity_threat_fires_level'                       : sal.NVARCHAR(length=None),
    'commodity_threat_overall_level'                     : sal.NVARCHAR(length=None),
    'commodity_threat_overall_score'                     : sal.NVARCHAR(length=None),
    'commodity_value_forest_extent_level'                : sal.NVARCHAR(length=None),
    'commodity_value_peat_level'                         : sal.NVARCHAR(length=None),
    'commodity_value_protected_areas_level'              : sal.NVARCHAR(length=None),
    'commodity_value_overall_level'                      : sal.NVARCHAR(length=None),
    'commodity_value_overall_score'                      : sal.NVARCHAR(length=None),
    'commodity_value_forest_extent'                      : sal.NVARCHAR(length=None),
    'commodity_value_peat'                               : sal.NVARCHAR(length=None),
    'commodity_value_protected_areas'                    : sal.NVARCHAR(length=None),
    'commodity_mill_priority_level'                      : sal.NVARCHAR(length=None),
    'commodity_mill_priority_score'                      : sal.NVARCHAR(length=None),
    'commodity_threat_deforestation'                     : sal.NVARCHAR(length=None),
    'commodity_threat_peat'                              : sal.NVARCHAR(length=None),
    'commodity_threat_protected_areas'                   : sal.NVARCHAR(length=None),
    'commodity_threat_fires'                             : sal.NVARCHAR(length=None),
    'dissolved_data_location_info'                       : sal.NVARCHAR(length=None),
    'tree_cover_loss_arg_otbn_yearly'                    : sal.NVARCHAR(length=None),
    'arg_otbn_area'                                      : sal.NVARCHAR(length=None),
    'argentina_presence'                                 : sal.NVARCHAR(length=None)
    }