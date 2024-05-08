// ---Layers START
// We are using names in the api to map out the layers
// key is universal id we use within the app, values is layer NAME in the API
export const proLayers = {
  argentineanNativeForestsLoss: 'argentinean-native-forests-loss',
  jrcGlobalForestCover: 'jrc_global_forest_cover',
  sBTNNaturalForest: 'SBTN Natural Forest',
  negligibleRisk: 'Negligible Risk',
  cocoaDeforestationRisk: 'cocoa_deforestation_risk',
  otbn: 'Land Planning Classification of Native Forests',
  clarkLabsAquacultureLandCover: 'Clark Labs Aquaculture Land Cover 2018',
  clarkLabsAquacultureLandChange: 'Clark Labs Aquaculture Land Change',
  treeCoverLossID: 'Tree cover loss',
  treeCoverGainID: 'Tree cover gain',
  prodesDeforestationID: 'PRODES Deforestation Vizz',
  treeBiomassLossID: 'Tree biomass loss',
  gladAlertsID: 'GLAD-L alerts',
  gladLGeographicCoverageID: 'GLAD-L Alerts Geographic Coverage',
  gladS2AlertsID: 'GLAD-S2 alerts',
  gladS2GeographicCoverageID: 'GLAD-S2 alerts geographic coverage',
  raddAlertsID: 'RADD alerts',
  raddCoverageID: 'RADD Coverage',
  integratedDeforestationAlertsID: 'Integrated Deforestation Alerts',
  integratedAlertsGeographicCoverageID: 'integrated alerts geographic coverage',
  viirsActiveFiresID: 'VIIRS Global Fires',
  treeCoverID: 'Tree cover 2000',
  congoPrimaryForestsID: 'Congo Primary Forests',
  cameroonAgroIndustrialZonesID: 'Cameroon agro-industrial zones',
  republicOfTheCongoOilPalmConcessionsID: 'Republic of the Congo Oil Palm Concessions',
  universalMillList: 'Universal Mill List',
  administrativeAreas: 'administrative-areas', // this layer does not seem to exist in PROD api
  oilPalmConcessions: 'Oil Palm Concessions',
  soyPlantedArea: 'Soy Planted Area',
  aboveGroundBiomassId: 'Aboveground live woody biomass density',
  primaryForest: 'Primary Forest',
  treePlantationsSpecies: 'Tree Plantations by species',
  brazilBiomesID: 'Brazil Biomes',
  rspoConcessions: 'RSPO Concessions',
  rspoPalmOilMills: 'rspo-palm-oil-mills', // this layer does not seem to exist in PROD api
  protectedAreas: 'WDPA Esri',
  adminAreas: 'admin-areas', // this layer does not seem to exist in PROD api
  AZESites: 'Alliance for Zero Extinction Sites',
  landRights: 'Land Rights (Esri)',
  indoTreePlantationsSpecies: 'indonesia-tree-plantations-by-species', // this layer does not seem to exist in PROD api
  indoTreePlantationsType: 'indonesia-tree-plantations-by-type', // this layer does not seem to exist in PROD api
  intactForestLandscapesID: 'Intact Forest Landscapes',
  globalPeatlandsID: 'Global Peatlands',
  landCoverID: 'Land cover',
  liberiaOilPalmConcessions: 'Liberia Oil Palm Concessions',
  liberiaTreePlantationsByType: 'liberia-tree-plantations-by-type', // does not exist in prod
  liberiaTreePlantationsBySpecies: 'liberia-tree-plantations-by-species', // does not exist in prod
  prodesDeforestationVizzBrazil: 'PRODES Deforestation Vizz Brazil',
  brazilRSPOOilPalmID: 'Brazil RSPO Certified Oil Palm Concessions',
  brazilTreeByTypeID: 'brazil-tree-plantations-by-type', // does not exist
  brazilTreeBySpeciesID: 'brazil-tree-plantations-by-species', // does not exist
  landCoverSEAsiaID: 'Land Cover Southeast Asia',
  indonesiaForestMoratorium: 'Indonesia Forest Moratorium',
  indonesiaLegalClass: 'Indonesia Forest Area',
  indonesiaOilPalmClass: 'Indonesia Oil Palm Concessions',
  indonesiaPeatLands: 'Indonesia Peat Lands',
  indonesiaPrimaryForest: 'Indonesia Primary Forests',
  indonesiaRSPO: 'RSPO Concessions (Indonesia)',
  indonesiaRSPOPalmOil: 'Indonesia RSPO palm oil mills',
  indonesiaLandCover: 'Indonesia Land Cover',
  malaysiaRSPO: 'RSPO Concessions (Malaysia)',
  sarawakOilPalm: 'Sarawak oil palm concessions',
  papuaNewGRSPO: 'RSPO Concessions (Papua New Guinea)',
  userLocations: 'user-locations',
};
// ----layers END

// Array that holds all vector tile cache layers that require their separate endpoint to fetch the features on click
export const vectorEnabledLayers = [
  proLayers.viirsActiveFiresID,
  proLayers.rspoConcessions,
  proLayers.protectedAreas,
  proLayers.oilPalmConcessions,
  proLayers.universalMillList,
];

export const densityDisplayLayers = [proLayers.treeCoverID, proLayers.treeBiomassLossID];

export const noLocationLayers = [proLayers.brazilBiomesID];

export const exclusiveDrawLayers = [
  proLayers.treeCoverLossID,
  proLayers.treeCoverGainID,
  proLayers.prodesDeforestationID,
  proLayers.treeBiomassLossID,
  proLayers.gladAlertsID,
  proLayers.viirsActiveFiresID,
];

export const exclusiveLayers = [
  proLayers.treeCoverLossID,
  proLayers.treeCoverGainID,
  proLayers.prodesDeforestationID,
  proLayers.treeBiomassLossID,
  proLayers.gladAlertsID,
  proLayers.gladS2AlertsID,
  proLayers.raddAlertsID,
  proLayers.integratedDeforestationAlertsID,
  proLayers.viirsActiveFiresID,
];

export const visibleLayers = [
  proLayers.treeCoverLossID,
  proLayers.treeCoverGainID,
  proLayers.treeCoverID,
];
