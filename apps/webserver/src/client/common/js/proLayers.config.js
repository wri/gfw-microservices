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

export const layerWarnings = [
  {
    id: proLayers.treeCoverLossID,
    title: 'Tree cover loss is not always deforestation',
    content:
      '<p class="basemap-modal-title">Tree cover loss is not always deforestation.</p><p>Loss of tree cover may occur for many reasons, including deforestation, fire, and ' +
      'logging within the course of sustainable forestry operations. In sustainably managed forests, ' +
      'the “loss” will eventually show up as “gain”, as young trees get large enough to achieve canopy closure.</p>',
  },
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
