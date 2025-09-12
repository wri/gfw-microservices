import { EntitySchemaColumnOptions } from 'typeorm';

export const AnalysisSchema = {
  name: 'analysis-xxxxx',
  columns: {
    id: {
      type: Number,
      primary: true,
    } as EntitySchemaColumnOptions,
    locationId: {
      type: Number,
      name: 'location_id',
      nullable: false,
      unique: true,
    },
    locationStatusId: {
      type: Number,
      name: 'location_status_id',
    },
    treeCoverLossTotalYearly: {
      type: String,
      name: 'tree_cover_loss_total_yearly',
      nullable: true,
    },
    treeCoveLossPrimaryForestYearly: {
      type: String,
      name: 'tree_cover_loss_primary_forest_yearly',
      nullable: true,
    },
    treeCoverLossPeatYearly: {
      type: String,
      name: 'tree_cover_loss_peat_yearly',
      nullable: true,
    },
    treeCoverLossIntactForestYearly: {
      type: String,
      name: 'tree_cover_loss_intact_forest_yearly',
      nullable: true,
    },
    treeCoverLossProtected_areas_yearly: {
      type: String,
      name: 'tree_cover_loss_protected_areas_yearly',
      nullable: true,
    },
    treeCoverLossSeaLandcoverYearly: {
      type: String,
      name: 'tree_cover_loss_sea_landcover_yearly',
      nullable: true,
    },
    treeCoverLossIdnLandcoverYearly: {
      type: String,
      name: 'tree_cover_loss_idn_landcover_yearly',
      nullable: true,
    },
    treeCoverLossIdnPrimaryForestYearly: {
      type: String,
      name: 'tree_cover_loss_idn_primary_forest_yearly',
      nullable: true,
    },
    treeCoverLossSoyYearly: {
      type: String,
      name: 'tree_cover_loss_soy_yearly',
      nullable: true,
    },
    treeCoverLossIdnLegalYearly: {
      type: String,
      name: 'tree_cover_loss_idn_legal_yearly',
      nullable: true,
    },
    treeCoverLossIdnForestMoratoriumYearly: {
      type: String,
      name: 'tree_cover_loss_idn_forest_moratorium_yearly',
      nullable: true,
    },
    treeCoverLossProdesYearly: {
      type: String,
      name: 'tree_cover_loss_prodes_yearly',
      nullable: true,
    },
    treeCoverLossProdesWdpaYearly: {
      type: String,
      name: 'tree_cover_loss_prodes_wdpa_yearly',
      nullable: true,
    },
    treeCoverLossProdesPrimaryForestYearly: {
      type: String,
      name: 'tree_cover_loss_prodes_primary_forest_yearly',
      nullable: true,
    },
    treeCoverLossBrazilBiomesYearly: {
      type: String,
      name: 'tree_cover_loss_brazil_biomes_yearly',
      nullable: true,
    },
    treeCoverExtentTotal: {
      type: Number,
      name: 'tree_cover_extent_total',
      nullable: true,
    },
    treeCoverExtentPrimaryForest: {
      type: Number,
      name: 'tree_cover_extent_primary_forest',
      nullable: true,
    },
    treeCoverExtentProtectedAreas: {
      type: Number,
      name: 'tree_cover_extent_protected_areas',
      nullable: true,
    },
    treeCoverExtentPeat: {
      type: Number,
      name: 'tree_cover_extent_peat',
      nullable: true,
    },
    treeCoverExtentIntactForest: {
      type: Number,
      name: 'tree_cover_extent_intact_forest',
      nullable: true,
    },
    naturalHabitatPrimary: {
      type: Number,
      name: 'natural_habitat_primary',
      nullable: true,
    },
    naturalHabitatIntactForest: {
      type: Number,
      name: 'natural_habitat_intact_forest',
      nullable: true,
      default: 0,
    },
    naturalHabitatGlobalLandCover: {
      type: String,
      name: 'natural_habitat_global_land_cover',
      nullable: true,
      default: 0,
    },
    totalArea: {
      type: Number,
      name: 'total_area',
      nullable: true,
    },
    protectedAreasArea: {
      type: Number,
      name: 'protected_areas_area',
      nullable: true,
    },
    criticalHabitatAllianceZero: {
      type: Number,
      name: 'critical_habitat_alliance_zero',
      nullable: true,
    },
    indigenousPeopleLandRights: {
      type: Number,
      name: 'indigenous_people_land_rights',
      nullable: true,
    },
    peatArea: {
      type: Number,
      name: 'peat_area',
      nullable: true,
    },
    firesCountsMonthly: {
      type: String,
      name: 'fires_counts_monthly',
      nullable: true,
    },
    soyTotalArea: {
      type: String,
      name: 'soy_total_area',
      nullable: true,
    },
    soyPre2001NonForestArea: {
      type: Number,
      name: 'soy_pre2001_nonforest_area',
      nullable: true,
    },
    brazilBiomes: {
      type: String,
      name: 'brazil_biomes',
      nullable: true,
    },
    idnLegalArea: {
      type: String,
      name: 'idn_legal_area',
      nullable: true,
    },
    seaLandcoverArea: {
      type: String,
      name: 'sea_landcover_area',
      nullable: true,
    },
    idnLandcoverArea: {
      type: String,
      name: 'idn_landcover_area',
      nullable: true,
    },
    idnForestMoratoriumArea: {
      type: Number,
      name: 'idn_forest_moratorium_area',
      nullable: true,
    },
    southAmericaPresence: {
      type: String,
      name: 'south_america_presence',
      nullable: true,
    },
    legalAmazonPresence: {
      type: String,
      name: 'legal_amazon_presence',
      nullable: true,
    },
    brazilBiomesPresence: {
      type: String,
      name: 'brazil_biomes_presence',
      nullable: true,
    },
    cerradoBiomePresence: {
      type: String,
      name: 'cerrado_biome_presence',
      nullable: true,
    },
    southeastAsiaPresence: {
      type: String,
      name: 'southeast_asia_presence',
      nullable: true,
    },
    indonesiaPresence: {
      type: String,
      name: 'indonesia_presence',
      nullable: true,
    },
    commodityThreatDeforestationLevel: {
      type: String,
      name: 'commodity_threat_deforestation_level',
      nullable: true,
    },
    commodityThreatPeatLevel: {
      type: String,
      name: 'commodity_threat_peat_level',
      nullable: true,
    },
    commodityThreatProtectedAreasLevel: {
      type: String,
      name: 'commodity_threat_protected_areas_level',
      nullable: true,
    },
    commodityThreatFiresLevel: {
      type: String,
      name: 'commodity_threat_fires_level',
      nullable: true,
    },
    commodityThreatOverallLevel: {
      type: String,
      name: 'commodity_threat_overall_level',
      nullable: true,
    },
    commodityThreatOverallScore: {
      type: String,
      name: 'commodity_threat_overall_score',
      nullable: true,
    },
    commodityValueForestExtentLevel: {
      type: String,
      name: 'commodity_value_forest_extent_level',
      nullable: true,
    },
    commodityValuePeatLevel: {
      type: String,
      name: 'commodity_value_peat_level',
      nullable: true,
    },
    commodityValueProtectedAreasLevel: {
      type: String,
      name: 'commodity_value_protected_areas_level',
      nullable: true,
    },
    commodityValueOverallLevel: {
      type: String,
      name: 'commodity_value_overall_level',
      nullable: true,
    },
    commodityValueOverallScore: {
      type: String,
      name: 'commodity_value_overall_score',
      nullable: true,
    },
    commodityValueForestExtent: {
      type: String,
      name: 'commodity_value_forest_extent',
      nullable: true,
    },
    commodityValuePeat: {
      type: String,
      name: 'commodity_value_peat',
      nullable: true,
    },
    commodityValueProtectedAreas: {
      type: String,
      name: 'commodity_value_protected_areas',
      nullable: true,
    },
    commodityMillPriorityLevel: {
      type: String,
      name: 'commodity_mill_priority_level',
      nullable: true,
    },
    commodityMillPriorityScore: {
      type: String,
      name: 'commodity_mill_priority_score',
      nullable: true,
    },
    commodityThreatDeforestation: {
      type: String,
      name: 'commodity_threat_deforestation',
      nullable: true,
    },
    commodityThreatPe21at: {
      type: String,
      name: 'commodity_threat_peat',
      nullable: true,
    },
    commodityThreatProtectedAreas: {
      type: String,
      name: 'commodity_threat_protected_areas',
      nullable: true,
    },
    commodityThreatFires: {
      type: String,
      name: 'commodity_threat_fires',
      nullable: true,
    },
    dissolvedDataLocationInfo: {
      type: String,
      name: 'dissolved_data_location_info',
      nullable: true,
    },
    argOtbnArea: {
      type: String,
      name: 'arg_otbn_area',
      nullable: true,
    },
    protectedAreasByCategoryArea: {
      type: String,
      name: 'protected_areas_by_category_area',
      nullable: true,
    },
    landmarkByCategoryArea: {
      type: String,
      name: 'landmark_by_category_area',
      nullable: true,
    },
    countrySpecificDeforestationYearly: {
      type: String,
      name: 'country_specific_deforestation_yearly',
      nullable: true,
    },
    countrySpecificDeforestationWdpaYearly: {
      type: String,
      name: 'country_specific_deforestation_wdpa_yearly',
      nullable: true,
    },
    countrySpecificDeforestationClassifiedRegionYearly: {
      type: String,
      name: 'country_specific_deforestation_classified_region_yearly',
      nullable: true,
    },
    treeCoverLossByCountryYearly: {
      type: String,
      name: 'tree_cover_loss_by_country_yearly',
      nullable: true,
    },
    treeCoverLossByCountryWdpaYearly: {
      type: String,
      name: 'tree_cover_loss_by_country_wdpa_yearly',
      nullable: true,
    },
    treeCoverLossByCountryLandmarkYearly: {
      type: String,
      name: 'tree_cover_loss_by_country_landmark_yearly',
      nullable: true,
    },
    locationError: {
      type: String,
      name: 'location_error',
      nullable: true,
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
  locationError: string;
}
