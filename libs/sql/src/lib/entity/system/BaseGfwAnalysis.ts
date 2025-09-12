import { BaseEntity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Step 1: Create a base entity with common columns
@Unique(['id', 'LocationId'])
export abstract class BaseGfwAnalysis extends BaseEntity {
  @Column({ name: 'id' })
  'id': number;

  @PrimaryGeneratedColumn({ name: 'location_id' })
  LocationId: number;

  @Column({ name: 'location_status_id' })
  'location_status_id': number;

  @Column({ name: 'tree_cover_loss_total_yearly' })
  'tree_cover_loss_total_yearly': number;

  @Column({ name: 'tree_cover_loss_primary_forest_yearly' })
  'tree_cover_loss_primary_forest_yearly': string;

  @Column({ name: 'tree_cover_loss_peat_yearly' })
  'tree_cover_loss_peat_yearly': string;

  @Column({ name: 'tree_cover_loss_intact_forest_yearly' })
  'tree_cover_loss_intact_forest_yearly': string;

  @Column({ name: 'tree_cover_loss_protected_areas_yearly' })
  'tree_cover_loss_protected_areas_yearly': string;

  @Column({ name: 'tree_cover_loss_sea_landcover_yearly' })
  'tree_cover_loss_sea_landcover_yearly': string;

  @Column({ name: 'tree_cover_loss_idn_landcover_yearly' })
  'tree_cover_loss_idn_landcover_yearly': string;

  @Column({ name: 'tree_cover_loss_idn_primary_forest_yearly' })
  'tree_cover_loss_idn_primary_forest_yearly': string;

  @Column({ name: 'tree_cover_loss_soy_yearly' })
  'tree_cover_loss_soy_yearly': string;

  @Column({ name: 'tree_cover_loss_idn_legal_yearly' })
  'tree_cover_loss_idn_legal_yearly': string;

  @Column({ name: 'tree_cover_loss_idn_forest_moratorium_yearly' })
  'tree_cover_loss_idn_forest_moratorium_yearly': string;

  @Column({ name: 'tree_cover_loss_prodes_yearly' })
  'tree_cover_loss_prodes_yearly': string;

  @Column({ name: 'tree_cover_loss_prodes_wdpa_yearly' })
  'tree_cover_loss_prodes_wdpa_yearly': string;

  @Column({ name: 'tree_cover_loss_prodes_primary_forest_yearly' })
  'tree_cover_loss_prodes_primary_forest_yearly': string;

  @Column({ name: 'tree_cover_loss_brazil_biomes_yearly' })
  'tree_cover_loss_brazil_biomes_yearly': string;

  @Column({ name: 'tree_cover_extent_total' })
  'tree_cover_extent_total': number;

  @Column({ name: 'tree_cover_extent_primary_forest' })
  'tree_cover_extent_primary_forest': number;

  @Column({ name: 'tree_cover_extent_protected_areas' })
  'tree_cover_extent_protected_areas': number;

  @Column({ name: 'tree_cover_extent_peat' })
  'tree_cover_extent_peat': number;

  @Column({ name: 'tree_cover_extent_intact_forest' })
  'tree_cover_extent_intact_forest': number;

  @Column({ name: 'natural_habitat_primary' })
  'natural_habitat_primary': number;

  @Column({ name: 'natural_habitat_intact_forest' })
  'natural_habitat_intact_forest': number;

  @Column({ name: 'natural_habitat_global_land_cover' })
  'natural_habitat_global_land_cover': string;

  @Column({ name: 'total_area' })
  'total_area': number;

  @Column({ name: 'protected_areas_area' })
  'protected_areas_area': number;

  @Column({ name: 'critical_habitat_alliance_zero' })
  'critical_habitat_alliance_zero': number;

  @Column({ name: 'indigenous_people_land_rights' })
  'indigenous_people_land_rights': number;

  @Column({ name: 'peat_area' })
  'peat_area': number;

  @Column({ name: 'fires_counts_monthly' })
  'fires_counts_monthly': string;

  @Column({ name: 'soy_total_area' })
  'soy_total_area': string;

  @Column({ name: 'soy_pre2001_nonforest_area' })
  'soy_pre2001_nonforest_area': number;

  @Column({ name: 'brazil_biomes' })
  'brazil_biomes': string;

  @Column({ name: 'idn_legal_area' })
  'idn_legal_area': string;

  @Column({ name: 'sea_landcover_area' })
  'sea_landcover_area': string;

  @Column({ name: 'idn_landcover_area' })
  'idn_landcover_area': string;

  @Column({ name: 'idn_forest_moratorium_area' })
  'idn_forest_moratorium_area': number;

  @Column({ name: 'south_america_presence' })
  'south_america_presence': string;

  @Column({ name: 'legal_amazon_presence' })
  'legal_amazon_presence': string;

  @Column({ name: 'brazil_biomes_presence' })
  'brazil_biomes_presence': string;

  @Column({ name: 'cerrado_biome_presence' })
  'cerrado_biome_presence': string;

  @Column({ name: 'southeast_asia_presence' })
  'southeast_asia_presence': string;

  @Column({ name: 'indonesia_presence' })
  'indonesia_presence': string;

  @Column({ name: 'commodity_threat_deforestation_level' })
  'commodity_threat_deforestation_level': string;

  @Column({ name: 'commodity_threat_peat_level' })
  'commodity_threat_peat_level': string;

  @Column({ name: 'commodity_threat_protected_areas_level' })
  'commodity_threat_protected_areas_level': string;

  @Column({ name: 'commodity_threat_fires_level' })
  'commodity_threat_fires_level': string;

  @Column({ name: 'commodity_threat_overall_level' })
  'commodity_threat_overall_level': string;

  @Column({ name: 'commodity_threat_overall_score' })
  'commodity_threat_overall_score': string;

  @Column({ name: 'commodity_value_forest_extent_level' })
  'commodity_value_forest_extent_level': string;

  @Column({ name: 'commodity_value_peat_level' })
  'commodity_value_peat_level': string;

  @Column({ name: 'commodity_value_protected_areas_level' })
  'commodity_value_protected_areas_level': string;

  @Column({ name: 'commodity_value_overall_level' })
  'commodity_value_overall_level': string;

  @Column({ name: 'commodity_value_overall_score' })
  'commodity_value_overall_score': string;

  @Column({ name: 'commodity_value_forest_extent' })
  'commodity_value_forest_extent': string;

  @Column({ name: 'commodity_value_peat' })
  'commodity_value_peat': string;

  @Column({ name: 'commodity_value_protected_areas' })
  'commodity_value_protected_areas': string;

  @Column({ name: 'commodity_mill_priority_level' })
  'commodity_mill_priority_level': string;

  @Column({ name: 'commodity_mill_priority_score' })
  'commodity_mill_priority_score': string;

  @Column({ name: 'commodity_threat_deforestation' })
  'commodity_threat_deforestation': string;

  @Column({ name: 'commodity_threat_peat' })
  'commodity_threat_peat': string;

  @Column({ name: 'commodity_threat_protected_areas' })
  'commodity_threat_protected_areas': string;

  @Column({ name: 'commodity_threat_fires' })
  'commodity_threat_fires': string;

  @Column({ name: 'dissolved_data_location_info' })
  'dissolved_data_location_info': string;

  @Column({ name: 'arg_otbn_area' })
  'arg_otbn_area': string;

  @Column({ name: 'protected_areas_by_category_area' })
  'protected_areas_by_category_area': string;

  @Column({ name: 'landmark_by_category_area' })
  'landmark_by_category_area': string;

  @Column({ name: 'country_specific_deforestation_yearly' })
  'country_specific_deforestation_yearly': string;

  @Column({ name: 'country_specific_deforestation_wdpa_yearly' })
  'country_specific_deforestation_wdpa_yearly': string;

  @Column({ name: 'country_specific_deforestation_landmark_yearly' })
  'country_specific_deforestation_landmark_yearly': string;

  @Column({ name: 'country_specific_deforestation_classified_region_yearly' })
  'country_specific_deforestation_classified_region_yearly': string;

  @Column({ name: 'tree_cover_loss_by_country_yearly' })
  'tree_cover_loss_by_country_yearly': string;

  @Column({ name: 'tree_cover_loss_by_country_wdpa_yearly' })
  'tree_cover_loss_by_country_wdpa_yearly': string;

  @Column({ name: 'tree_cover_loss_by_country_landmark_yearly' })
  'tree_cover_loss_by_country_landmark_yearly': string;

  @Column({ name: 'country_area' })
  'country_area': string;

  @Column({ name: 'classified_region_area' })
  'classified_region_area': string;

  @Column({ name: 'tree_cover_loss_by_country_classified_region_yearly' })
  'tree_cover_loss_by_country_classified_region_yearly': string;
}
