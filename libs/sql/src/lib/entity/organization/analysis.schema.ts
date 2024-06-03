import { EntitySchemaColumnOptions } from 'typeorm';

export const AnalysisSchema = {
  name: 'analysis-xxxxx',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    } as EntitySchemaColumnOptions,
    locationId: {
      type: Number,
      name: 'location_id',
    },
    locationStatusId: {
      type: Number,
      name: 'location_status_id',
    },
    treeCoverLossTotalYearly: {
      type: String,
      name: 'tree_cover_loss_total_yearly',
    },
    treeCoveLossPrimaryForestYearly: {
      type: String,
      name: 'tree_cover_loss_primary_forest_yearly',
    },
    treeCoverLossPeatYearly: {
      type: String,
      name: 'tree_cover_loss_peat_yearly',
    },
    treeCoverLossIntactForestYearly: {
      type: String,
      name: 'tree_cover_loss_intact_forest_yearly',
    },
    treeCoverLossProtected_areas_yearly: {
      type: String,
      name: 'tree_cover_loss_protected_areas_yearly',
    },
    treeCoverLossSeaLandcoverYearly: {
      type: String,
      name: 'tree_cover_loss_sea_landcover_yearly',
    },
    treeCoverLossIdnLandcoverYearly: {
      type: String,
      name: 'tree_cover_loss_idn_landcover_yearly',
    },
    treeCoverLossIdnPrimaryForestYearly: {
      type: String,
      name: 'tree_cover_loss_idn_primary_forest_yearly',
    },
    treeCoverLossSoyYearly: {
      type: String,
      name: 'tree_cover_loss_soy_yearly',
    },
    treeCoverLossIdnLegalYearly: {
      type: String,
      name: 'tree_cover_loss_idn_legal_yearly',
    },
    treeCoverLossIdnForestMoratoriumYearly: {
      type: String,
      name: 'tree_cover_loss_idn_forest_moratorium_yearly',
    },
    treeCoverLossProdesYearly: {
      type: String,
      name: 'tree_cover_loss_prodes_yearly',
    },
    treeCoverLossProdesWdpaYearly: {
      type: String,
      name: 'tree_cover_loss_prodes_wdpa_yearly',
    },
    treeCoverLossProdesPrimaryForestYearly: {
      type: String,
      name: 'tree_cover_loss_prodes_primary_forest_yearly',
    },
    treeCoverLossBrazilBiomesYearly: {
      type: String,
      name: 'tree_cover_loss_brazil_biomes_yearly',
    },
    treeCoverExtentTotal: {
      type: Number,
      name: 'tree_cover_extent_total',
    },
    treeCoverExtentPrimaryForest: {
      type: Number,
      name: 'tree_cover_extent_primary_forest',
    },
    treeCoverExtentProtectedAreas: {
      type: Number,
      name: 'tree_cover_extent_protected_areas',
    },
    treeCoverExtentPeat: {
      type: Number,
      name: 'tree_cover_extent_peat',
    },
    treeCoverExtentIntactForest: {
      type: Number,
      name: 'tree_cover_extent_intact_forest',
    },
    naturalHabitatPrimary: {
      type: Number,
      name: 'natural_habitat_primary',
    },
    naturalHabitatIntactForest: {
      type: Number,
      name: 'natural_habitat_intact_forest',
    },
    naturalHabitatGlobalLandCover: {
      type: String,
      name: 'natural_habitat_global_land_cover',
    },
    totalArea: {
      type: Number,
      name: 'total_area',
    },
    protectedAreasArea: {
      type: Number,
      name: 'protected_areas_area',
    },
    criticalHabitatAllianceZero: {
      type: Number,
      name: 'critical_habitat_alliance_zero',
    },
    indigenousPeopleLandRights: {
      type: Number,
      name: 'indigenous_people_land_rights',
    },
    peatArea: {
      type: Number,
      name: 'peat_area',
    },
    firesCountsMonthly: {
      type: String,
      name: 'fires_counts_monthly',
    },
    soyTotalArea: {
      type: String,
      name: 'soy_total_area',
    },
    soyPre2001NonForestArea: {
      type: Number,
      name: 'soy_pre2001_nonforest_area',
    },
    brazilBiomes: {
      type: String,
      name: 'brazil_biomes',
    },
    idnLegalArea: {
      type: String,
      name: 'idn_legal_area',
    },
    seaLandcoverArea: {
      type: String,
      name: 'sea_landcover_area',
    },
    idnLandcoverArea: {
      type: String,
      name: 'idn_landcover_area',
    },
    idnForestMoratoriumArea: {
      type: Number,
      name: 'idn_forest_moratorium_area',
    },
    southAmericaPresence: {
      type: String,
      name: 'south_america_presence',
    },
    legalAmazonPresence: {
      type: String,
      name: 'legal_amazon_presence',
    },
    brazilBiomesPresence: {
      type: String,
      name: 'brazil_biomes_presence',
    },
    cerradoBiomePresence: {
      type: String,
      name: 'cerrado_biome_presence',
    },
    southeastAsiaPresence: {
      type: String,
      name: 'southeast_asia_presence',
    },
    indonesiaPresence: {
      type: String,
      name: 'indonesia_presence',
    },
    commodityThreatDeforestationLevel: {
      type: String,
      name: 'commodity_threat_deforestation_level',
    },
    commodityThreatPeatLevel: {
      type: String,
      name: 'commodity_threat_peat_level',
    },
    commodityThreatProtectedAreasLevel: {
      type: String,
      name: 'commodity_threat_protected_areas_level',
    },
    commodityThreatFiresLevel: {
      type: String,
      name: 'commodity_threat_fires_level',
    },
    commodityThreatOverallLevel: {
      type: String,
      name: 'commodity_threat_overall_level',
    },
    commodityThreatOverallScore: {
      type: String,
      name: 'commodity_threat_overall_score',
    },
    commodityValueForestExtentLevel: {
      type: String,
      name: 'commodity_value_forest_extent_level',
    },
    commodityValuePeatLevel: {
      type: String,
      name: 'commodity_value_peat_level',
    },
    commodityValueProtectedAreasLevel: {
      type: String,
      name: 'commodity_value_protected_areas_level',
    },
    commodityValueOverallLevel: {
      type: String,
      name: 'commodity_value_overall_level',
    },
    commodityValueOverallScore: {
      type: String,
      name: 'commodity_value_overall_score',
    },
    commodityValueForestExtent: {
      type: String,
      name: 'commodity_value_forest_extent',
    },
    commodityValuePeat: {
      type: String,
      name: 'commodity_value_peat',
    },
    commodityValueProtectedAreas: {
      type: String,
      name: 'commodity_value_protected_areas',
    },
    commodityMillPriorityLevel: {
      type: String,
      name: 'commodity_mill_priority_level',
    },
    commodityMillPriorityScore: {
      type: String,
      name: 'commodity_mill_priority_score',
    },
    commodityThreatDeforestation: {
      type: String,
      name: 'commodity_threat_deforestation',
    },
    commodityThreatPeat: {
      type: String,
      name: 'commodity_threat_peat',
    },
    commodityThreatProtectedAreas: {
      type: String,
      name: 'commodity_threat_protected_areas',
    },
    commodityThreatFires: {
      type: String,
      name: 'commodity_threat_fires',
    },
    dissolvedDataLocationInfo: {
      type: String,
      name: 'dissolved_data_location_info',
    },
    treeCoverLossArgOtbnYearly: {
      type: String,
      name: 'tree_cover_loss_arg_otbn_yearly',
    },
    argOtbnArea: {
      type: String,
      name: 'arg_otbn_area',
    },
    argentinaPresence: {
      type: String,
      name: 'argentina_presence',
    },
    protectedAreasByCategoryArea: {
      type: String,
      name: 'protected_areas_by_category_area',
    },
    landmarkByCategoryArea: {
      type: String,
      name: 'landmark_by_category_area',
    },
    countrySpecificDeforestationYearly: {
      type: String,
      name: 'country_specific_deforestation_yearly',
    },
    countrySpecificDeforestationWdpaYearly: {
      type: String,
      name: 'country_specific_deforestation_wdpa_yearly',
    },
    countrySpecificDeforestationClassifiedRegionYearly: {
      type: String,
      name: 'country_specific_deforestation_classified_region_yearly',
    },
    treeCoverLossByCountryYearly: {
      type: String,
      name: 'tree_cover_loss_by_country_yearly',
    },
    treeCoverLossByCountryWdpaYearly: {
      type: String,
      name: 'tree_cover_loss_by_country_wdpa_yearly',
    },
    treeCoverLossByCountryLandmarkYearly: {
      type: String,
      name: 'tree_cover_loss_by_country_landmark_yearly',
    },
  },
};

export interface AnalysisSchemaType {
  id: number;
  argentinaPresence: string;
  argOtbnArea: string;
  brazilBiomes: string;
  brazilBiomesPresence: string;
  cerradoBiomePresence: string;
  commodityMillPriorityLevel: string;
  commodityMillPriorityScore: string;
  commodityThreatDeforestation: string;
  commodityThreatDeforestationLevel: string;
  commodityThreatFires: string;
  commodityThreatFiresLevel: string;
  commodityThreatOverallLevel: string;
  commodityThreatOverallScore: string;
  commodityThreatPeat: string;
  commodityThreatPeatLevel: string;
  commodityThreatProtectedAreas: string;
  commodityThreatProtectedAreasLevel: string;
  commodityValueForestExtent: string;
  commodityValueForestExtentLevel: string;
  commodityValueOverallLevel: string;
  commodityValueOverallScore: string;
  commodityValuePeat: string;
  commodityValuePeatLevel: string;
  commodityValueProtectedAreas: string;
  commodityValueProtectedAreasLevel: string;
  countrySpecificDeforestationClassifiedRegionYearly: string;
  countrySpecificDeforestationLandmarkYearly: string;
  countrySpecificDeforestationWdpaYearly: string;
  countrySpecificDeforestationYearly: string;
  criticalHabitatAllianceZero: number;
  dissolvedDataLocationInfo: string;
  firesCountsMonthly: string;
  idnForestMoratoriumArea: number;
  idnLandcoverArea: string;
  idnLegalArea: string;
  indigenousPeopleLandRights: number;
  indonesiaPresence: string;
  landmarkByCategoryArea: string;
  legalAmazonPresence: string;
  locationId: number;
  locationStatusId: number;
  naturalHabitatGlobalLandCover: string;
  naturalHabitatIntactForest: number;
  naturalHabitatPrimary: number;
  peatArea: number;
  protectedAeasByCategoryArea: string;
  protectedAreasArea: number;
  seaLandcoverArea: string;
  southAmericaPresence: string;
  southeastAsiaPresence: string;
  soyPre2001NonForestArea: number;
  soyTotalArea: string;
  totalArea: number;
  treeCoverExtentIntactForest: number;
  treeCoverExtentPeat: number;
  treeCoverExtentPrimaryForest: number;
  treeCoverExtentProtectedAreas: number;
  treeCoverExtentTotal: number;
  treeCoverLossArgOtbnYearly: string;
  treeCoverLossBrazilBiomesYearly: string;
  treeCoverLossByCountryLandmarkYearly: string;
  treeCoverLossByCountryWdpaYearly: string;
  treeCoverLossByCountryYearly: string;
  treeCoverLossIdnForestMoratoriumYearly: string;
  treeCoverLossIdnLandcoverYearly: string;
  treeCoverLossIdnLegalYearly: string;
  treeCoverLossIdnPrimaryForestYearly: string;
  treeCoverLossIntactForestYearly: string;
  treeCoverLossPeatYearly: string;
  treeCoverLossPrimaryForestYearly: string;
  treeCoverLossProdesPrimaryForestYearly: string;
  treeCoverLossProdesWdpaYearly: string;
  treeCoverLossProdesYearly: string;
  treeCoverLossProtectedAreasYearly: string;
  treeCoverLossSeaLandcoverYearly: string;
  treeCoverLossSoyYearly: string;
  treeCoverLossTotalYearly: string;
}
