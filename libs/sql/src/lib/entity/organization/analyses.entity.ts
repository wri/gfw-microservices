import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Analyses' })
export class Analyses {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'list_id' })
  listId: number;

  @Column({ name: 'status_id' })
  statusId: number;

  @Column({ name: 'analysis_success_count' })
  analysisSuccessCount: number;

  @Column({ name: 'analysis_fail_count' })
  analysisFailCount: number;

  @Column({ name: 'tree_cover_loss_total_yearly' })
  treeCoverLossTotalYearly: string;

  @Column({ name: 'tree_cover_loss_primary_forest_yearly' })
  treeCoverLossPrimaryForestYearly: string;

  @Column({ name: 'tree_cover_loss_peat_yearly' })
  treeCoverLossPeatYearly: string;

  @Column({ name: 'tree_cover_loss_intact_forest_yearly' })
  treeCoverLossIntactForestYearly: string;

  @Column({ name: 'tree_cover_loss_protected_areas_yearly' })
  treeCoverLossProtectedAreasYearly: string;

  @Column({ name: 'tree_cover_loss_sea_landcover_yearly' })
  treeCoverLossSeaLandcoverYearly: string;

  @Column({ name: 'tree_cover_loss_idn_landcover_yearly' })
  treeCoverLossIdnLandcoverYearly: string;

  @Column({ name: 'tree_cover_loss_idn_primary_forest_yearly' })
  treeCoverLossIdnPrimaryForestYearly: string;

  @Column({ name: 'tree_cover_loss_soy_yearly' })
  treeCoverLossSoyYearly: string;

  @Column({ name: 'tree_cover_loss_idn_legal_yearly' })
  treeCoverLossIdnLegalYearly: string;

  @Column({ name: 'tree_cover_loss_idn_forest_moratorium_yearly' })
  treeCoverLossIdnForestMoratoriumYearly: string;

  @Column({ name: 'tree_cover_loss_prodes_yearly' })
  treeCoverLossProdesYearly: string;

  @Column({ name: 'tree_cover_loss_prodes_wdpa_yearly' })
  treeCoverLossProdesWdpaYearly: string;

  @Column({ name: 'tree_cover_loss_prodes_primary_forest_yearly' })
  treeCoverLossProdesPrimaryForestYearly: string;

  @Column({ name: 'tree_cover_loss_brazil_biomes_yearly' })
  treeCoverLossBrazilBiomesYearly: string;

  @Column({ name: 'tree_cover_extent_total' })
  treeCoverExtentTotal: number;

  @Column({ name: 'tree_cover_extent_primary_forest' })
  treeCoverExtentPrimaryForest: number;

  @Column({ name: 'tree_cover_extent_protected_areas' })
  treeCoverExtentProtectedAreas: number;

  @Column({ name: 'tree_cover_extent_peat' })
  treeCoverExtentPeat: number;

  @Column({ name: 'tree_cover_extent_intact_forest' })
  treeCoverExtentIntactForest: number;

  @Column({ name: 'natural_habitat_primary' })
  naturalHabitatPrimary: number;

  @Column({ name: 'natural_habitat_intact_forest' })
  naturalHabitatIntactForest: number;

  @Column({ name: 'natural_habitat_global_land_cover' })
  naturalHabitatGlobalLandCover: string;

  @Column({ name: 'total_area' })
  totalArea: number;

  @Column({ name: 'protected_areas_area' })
  protectedAreasArea: number;

  @Column({ name: 'critical_habitat_alliance_zero' })
  criticalHabitatAllianceZero: number;

  @Column({ name: 'indigenous_people_land_rights' })
  indigenousPeopleLandRights: number;

  @Column({ name: 'peat_area' })
  peatArea: number;

  @Column({ name: 'fires_counts_monthly' })
  firesCountsMonthly: string;

  @Column({ name: 'soy_total_area' })
  soyTotalArea: string;

  @Column({ name: 'soy_pre2001_nonforest_area' })
  soyPre2001NonforestArea: number;

  @Column({ name: 'brazil_biomes' })
  brazilBiomes: string;

  @Column({ name: 'idn_legal_area' })
  idnLegalArea: string;

  @Column({ name: 'sea_landcover_area' })
  seaLandcoverArea: string;

  @Column({ name: 'idn_landcover_area' })
  idnLandcoverArea: string;

  @Column({ name: 'idn_forest_moratorium_area' })
  idnForestMoratoriumArea: number;

  @Column({ name: 'south_america_presence' })
  southAmericaPresence: string;

  @Column({ name: 'legal_amazon_presence' })
  legalAmazonPresence: string;

  @Column({ name: 'brazil_biomes_presence' })
  brazilBiomesPresence: string;

  @Column({ name: 'cerrado_biome_presence' })
  cerradoBiomePresence: string;

  @Column({ name: 'southeast_asia_presence' })
  southeastAsiaPresence: string;

  @Column({ name: 'indonesia_presence' })
  indonesiaPresence: string;

  @Column({ name: 'commodity_threat_deforestation_level' })
  commodityThreatDeforestationLevel: string;

  @Column({ name: 'commodity_threat_peat_level' })
  commodityThreatPeatLevel: string;

  @Column({ name: 'commodity_threat_protected_areas_level' })
  commodityThreatProtectedAreasLevel: string;

  @Column({ name: 'commodity_threat_fires_level' })
  commodityThreatFiresLevel: string;

  @Column({ name: 'commodity_threat_overall_level' })
  commodityThreatOverallLevel: string;

  @Column({ name: 'commodity_threat_overall_score' })
  commodityThreatOverallScore: string;

  @Column({ name: 'commodity_value_forest_extent_level' })
  commodityValueForestExtentLevel: string;

  @Column({ name: 'commodity_value_peat_level' })
  commodityValuePeatLevel: string;

  @Column({ name: 'commodity_value_protected_areas_level' })
  commodityValueProtectedAreasLevel: string;

  @Column({ name: 'commodity_value_overall_level' })
  commodityValueOverallLevel: string;

  @Column({ name: 'commodity_value_overall_score' })
  commodityValueOverallScore: string;

  @Column({ name: 'commodity_value_forest_extent' })
  commodityValueForestExtent: string;

  @Column({ name: 'commodity_value_peat' })
  commodityValuePeat: string;

  @Column({ name: 'commodity_value_protected_areas' })
  commodityValueProtectedAreas: string;

  @Column({ name: 'commodity_mill_priority_level' })
  commodityMillPriorityLevel: string;

  @Column({ name: 'commodity_mill_priority_score' })
  commodityMillPriorityScore: string;

  @Column({ name: 'commodity_threat_deforestation' })
  commodityThreatDeforestation: string;

  @Column({ name: 'commodity_threat_peat' })
  commodityThreatPeat: string;

  @Column({ name: 'commodity_threat_protected_areas' })
  commodityThreatProtectedAreas: string;

  @Column({ name: 'commodity_threat_fires' })
  commodityThreatFires: string;

  @Column({ name: 'dissolved_geom_object_key' })
  dissolvedGeomObjectKey: string;

  @Column({ name: 'tree_cover_loss_arg_otbn_yearly' })
  treeCoverLossArgOtbnYearly: string;

  @Column({ name: 'arg_otbn_area' })
  argOtbnArea: string;

  @Column({ name: 'protected_areas_by_category_area' })
  protectedAreasByCategoryArea: string;

  @Column({ name: 'landmark_by_category_area' })
  landmarkByCategoryArea: string;

  @Column({ name: 'country_specific_deforestation_yearly' })
  countrySpecificDeforestationYearly: string;

  @Column({ name: 'country_specific_deforestation_wdpa_yearly' })
  countrySpecificDeforestationWdpaYearly: string;

  @Column({ name: 'country_specific_deforestation_landmark_yearly' })
  countrySpecificDeforestationLandmarkYearly: string;

  @Column({ name: 'country_specific_deforestation_classified_region_yearly' })
  countrySpecificDeforestationClassifiedRegionYearly: string;

  @Column({ name: 'tree_cover_loss_by_country_yearly' })
  treeCoverLossByCountryYearly: string;

  @Column({ name: 'tree_cover_loss_by_country_wdpa_yearly' })
  treeCoverLossByCountryWdpaYearly: string;

  @Column({ name: 'tree_cover_loss_by_country_landmark_yearly' })
  treeCoverLossByCountryLandmarkYearly: string;
}
