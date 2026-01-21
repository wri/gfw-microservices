/**
 * Default canopy density threshold (in percentage) for Tree Cover Loss layer.
 * This value represents the minimum canopy density required for tree cover loss to be displayed.
 */
export const DEFAULT_TREE_COVER_LOSS_CANOPY_DENSITY = 30;

// ---Layers START
// We are using names in the api to map out the layers
// key is universal id we use within the app, values is layer NAME in the API
export const proLayers = {
  argentineanNativeForestsLoss: 'argentinean-native-forests-loss',
  jrcGlobalForestCover: 'jrc_global_forest_cover',
  sbtnNaturalLands: 'SBTN Natural Lands',
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
  globalIntegratedDisturbanceAlertsId: 'Global Integrated Disturbance Alerts',
  integratedAlertsGeographicCoverageID: 'Integrated alerts geographic coverage',
  viirsActiveFiresID: 'VIIRS Global Fires',
  treeCoverID: 'Tree cover 2000',
  cameroonAgroIndustrialZonesID: 'Cameroon agro-industrial zones',
  soyPlantedArea: 'Soy Planted Area',
  pastureRecoveryPotential: 'Pasture Recovery Potential',
  aboveGroundBiomassId: 'Aboveground live woody biomass density',
  primaryForest: 'Primary Forest',
  treePlantationsSpecies: 'Tree Plantations by species',
  brazilBiomesID: 'Brazil Biomes',
  landRights: 'Land Rights (Esri)',
  intactForestLandscapesID: 'Intact Forest Landscapes',
  globalPeatlandsID: 'Global Peatlands',
  landCoverID: 'Land cover',
  prodesDeforestationVizzBrazil: 'PRODES Deforestation Vizz Brazil',
  landCoverSEAsiaID: 'Land Cover Southeast Asia',
  indonesiaForestMoratorium: 'Indonesia Forest Moratorium',
  indonesiaLegalClass: 'Indonesia Forest Area',
  indonesiaLandCover: 'Indonesia Land Cover',
  colombiaFronteraAgricola: 'Colombia - Frontera Agrícola',
  rspoPalmOilMills: 'rspo-palm-oil-mills',
  disturbanceAlertsDriversId: 'Disturbance Alerts Drivers',
  disturbanceAlertsDriversGeographicCoverageId: 'Disturbance Alerts Drivers Geographic Coverage',
  rspoConcessions: 'RSPO Concessions', // GFW list
  oilPalmConcessions: 'Oil Palm Concessions', // GFW list
  protectedAreas: 'WDPA Esri', // GFW list
  universalMillList: 'Universal Mill List', // GFW list: Palm Oil Mills
  globalVegetationDisturbanceAlertsId: 'Global vegetation disturbance alerts (DIST-ALERT)',
  globalVegetationDisturbanceAlertsGeographicCoverageId:
    'Global vegetation disturbance Geographic coverage global',

  // the next are not layers present in the map layer API as the previous ones
  // but they are constants that we use through the application
  administrativeAreas: 'administrative-areas', // GFW list
  adminAreas: 'admin-areas',
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
  proLayers.landRights,
];

export const densityDisplayLayers = [proLayers.treeCoverID, proLayers.treeBiomassLossID];

export const noLocationLayers = [proLayers.brazilBiomesID];

export const analysisEnabledLayers = [
  proLayers.treeCoverLossID,
  proLayers.gladAlertsID,
  proLayers.gladS2AlertsID,
  proLayers.raddAlertsID,
  proLayers.viirsActiveFiresID,
];

export const visibleLayers = [
  proLayers.treeCoverLossID,
  proLayers.treeCoverGainID,
  proLayers.treeCoverID,
];

export const layerWarnings = [
  {
    id: proLayers.argentineanNativeForestsLoss,
    title:
      '2007-2017 data not fully annualized; interpret with caution. See info bubble for details.',
    content:
      'The original data of the National Monitoring System of Native Forests is not completely annualized and reports forest loss for certain Argentinean regions pre-2017 in a series of date ranges that span multiple years. To visualize this data, multi-year ranges were transformed into annualized values by assigning the deforestation total to the final year of each range. Annual deforestation data from 2007-2017 should be interpreted with caution. The original data files can be accessed on the <a href="https://www.argentina.gob.ar/ambiente/bosques/monitoreo-bosques-nativos" target="_blank">Ministry of the Environment and Sustainable Development’s website</a>',
  },
];

export const downloadLinks = {
  [proLayers.treeCoverLossID]: 'https://earthenginepartners.appspot.com/science-2013-global-forest',
  [proLayers.treeCoverGainID]: 'https://earthenginepartners.appspot.com/science-2013-global-forest',
  [proLayers.prodesDeforestationID]:
    'http://www.obt.inpe.br/OBT/assuntos/programas/amazonia/prodes',
  [proLayers.treeBiomassLossID]:
    'https://data.globalforestwatch.org/datasets/d33587b6aee248faa2f388aaac96f92c_0',
  [proLayers.gladAlertsID]: 'http://glad-forest-alert.appspot.com/',
  [proLayers.viirsActiveFiresID]:
    'https://earthdata.nasa.gov/earth-observation-data/near-real-time/firms/active-fire-data',
};

export const gfwListsZoomTargets = {
  [proLayers.protectedAreas]: { target: [15, 27], zoom: 2 },
  [proLayers.oilPalmConcessions]: { target: [113.7, -0.9], zoom: 2 },
  [proLayers.universalMillList]: { target: [38.75, 8.35], zoom: 2 },
  [proLayers.rspoConcessions]: { target: [42.43, 8.94], zoom: 2 },
};
