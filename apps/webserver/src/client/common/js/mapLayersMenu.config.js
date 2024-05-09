import { proLayers } from './proLayers.config';

export const mapLayersMenu = [
  // Forest-change
  {
    id: proLayers.treeCoverLossID,
    group: 'forest-change',
    subGroup: 'tree-cover-change',
    order: 100,
  },
  {
    id: proLayers.treeCoverGainID,
    group: 'forest-change',
    subGroup: 'tree-cover-change',
    order: 101,
  },
  {
    id: proLayers.prodesDeforestationID,
    group: 'forest-change',
    subGroup: 'tree-cover-change',
    order: 102,
  },
  {
    id: proLayers.treeBiomassLossID,
    group: 'forest-change',
    subGroup: 'tree-cover-change',
    order: 104,
  },
  {
    id: proLayers.negligibleRisk,
    group: 'forest-change',
    subGroup: 'tree-cover-change',
    order: 105,
  },
  {
    id: proLayers.cocoaDeforestationRisk,
    group: 'forest-change',
    subGroup: 'tree-cover-change',
    order: 106,
  },

  {
    id: proLayers.gladAlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 107,
  },
  {
    id: proLayers.gladLGeographicCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 108,
  },
  {
    id: proLayers.gladS2AlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 108,
  },
  {
    id: proLayers.gladS2GeographicCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 110,
  },
  {
    id: proLayers.raddAlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 111,
  },
  {
    id: proLayers.raddCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    ignored: true,
    order: 112,
  },
  {
    id: proLayers.integratedDeforestationAlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 113,
  },
  {
    id: proLayers.integratedAlertsGeographicCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 114,
    ignored: true,
  },
  {
    id: proLayers.viirsActiveFiresID,
    group: 'forest-change',
    subGroup: 'fire-alerts',
    order: 115,
    popupTemplate: {
      title: null,
      // LATITUDE, LONGITUDE, BRIGHTNESS, CONFIDENCE, ACQ_DATE, ACQ_TIME
      content:
        '<div class="popup-text-container"><p class="popup-text-key">LATITUDE:</p> <p class="popup-text-value">{LATITUDE}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">LONGITUDE:</p> <p class="popup-text-value">{LONGITUDE}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">BRIGHTNESS:</p> <p class="popup-text-value">{BRIGHT_TI4}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">CONFIDENCE:</p> <p class="popup-text-value">{CONFIDENCE}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">ACQUISITION DATE:</p> <p class="popup-text-value">{ACQ_DATE:DateFormat(selector: "date", datePattern: "d MMMM, YYYY")}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">ACQUISITION TIME:</p> <p class="popup-text-value">{ACQ_TIME}</p></div>',
    },
    fields: [
      { id: 'BRIGHT_TI5', text: 'Bright TI5' },
      { id: 'CONFIDENCE', text: 'Confidence' },
    ],
  },
  // land-cover
  {
    id: proLayers.treeCoverID,
    group: 'land-cover',
    order: 200,
  },
  {
    id: proLayers.intactForestLandscapesID,
    group: 'land-cover',
    order: 201,
    fields: [
      { id: 'class_name', text: 'Class name' },
      { id: 'objectid', text: 'Object Id' },
    ],
  },
  {
    id: proLayers.primaryForest,
    group: 'land-cover',
    order: 202,
  },
  {
    id: proLayers.globalPeatlandsID,
    group: 'land-cover',
    order: 203,
  },
  {
    id: proLayers.aboveGroundBiomassId,
    group: 'land-cover',
    order: 204,
  },

  {
    id: proLayers.treePlantationsSpecies,
    group: 'land-cover',
    order: 206,
    popupTemplate: {
      // PLANTATION TYPE, species, percent plantation coverage, area ha
      content:
        '<div class="popup-text-container"><p class="popup-text-key">PLANTATION TYPE:</p> <p class="popup-text-value">{type_text}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">SPECIES:</p> <p class="popup-text-value">{spec_org}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">PERCENT<br /> PLANTATION<br /> COVERAGE:</p> <p class="popup-text-value">{percent}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">AREA HA:</p> <p class="popup-text-value">{area_ha:NumberFormat(places:1)}</p></div>',
    },
    fields: [],
  },
  {
    id: proLayers.landCoverID,
    group: 'land-cover',
    order: 207,
  },
  {
    id: proLayers.clarkLabsAquacultureLandCover,
    group: 'land-cover',
    order: 208,
  },
  {
    id: proLayers.clarkLabsAquacultureLandChange,
    group: 'land-cover',
    order: 209,
  },
  {
    id: proLayers.oilPalmConcessions,
    group: 'land-use',
    subGroup: 'concessions',
    order: 210,
    popupTemplate: {
      title: '{name}',
      // company, country, area ha
      content:
        '<div class="popup-text-container"><p class="popup-text-key">Company:</p> <p class="popup-text-value">{company}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">Country:</p> <p class="popup-text-value">{country}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">Area:</p> <p class="popup-text-value">{area_ha}</p></div>',
    },
    fields: [],
  },
  {
    id: proLayers.sBTNNaturalForest,
    group: 'land-cover',
    order: 211,
  },

  {
    id: proLayers.jrcGlobalForestCover,
    group: 'land-cover',
    order: 212,
  },

  // Land-Use
  {
    id: proLayers.rspoConcessions,
    group: 'land-use',
    subGroup: 'concessions',
    order: 301,
    popupTemplate: {
      title: '{plantation}',
      content:
        '<div class="popup-text-container"><p class="popup-text-key">Company:</p> <p class="popup-text-value">{company}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">Country:</p> <p class="popup-text-value">{country}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">Area:</p> <p class="popup-text-value">{shape_area}</p></div>',
    },
    fields: [],
  },
  {
    id: proLayers.soyPlantedArea,
    group: 'land-use',
    subGroup: 'crop-production',
    order: 302,
  },
  {
    id: proLayers.universalMillList,
    group: 'land-use',
    subGroup: 'infrastructure',
    order: 305,
    popupTemplate: {
      title: '{mill_name}',
      content:
        '<div class="popup-text-container"><p class="popup-text-key">MILL ID:</p> <p class="popup-text-value">{uml_id}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">CERTIFICATION:</p> <p class="popup-text-value">{rspo_statu}</p></div>',
    },
    fields: [],
  },
  {
    id: proLayers.rspoPalmOilMills,
    group: 'land-use',
    subGroup: 'infrastructure',
    order: 306,
    popupTemplate: {
      title: '{mill_name_}',
      content:
        '<div class="popup-text-container"><p class="popup-text-key">MILL ID:</p> <p class="popup-text-value">{wri_id}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">COMPANY:</p> <p class="popup-text-value">{company_na}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">GROUP:</p> <p class="popup-text-value">{group_name}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">CERTIFICATION:</p> <p class="popup-text-value">{certificat}</p></div>',
    },
    fields: [],
  },
  // Conservation
  {
    id: proLayers.protectedAreas,
    group: 'conservation',
    order: 401,
    popupTemplate: {
      title: '{name}',
      content:
        '<div class="popup-text-container"><p class="popup-text-key">LEGAL DESIGNATION:</p> <p class="popup-text-value">{desig}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">ID:</p> <p class="popup-text-value">{wdpaid}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">COUNTRY:</p> <p class="popup-text-value">{iso3}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">IUCN CATEGORY:</p> <p class="popup-text-value">{iucn_cat}</p></div>',
    },
  },
  {
    id: proLayers.landRights,
    group: 'people',
    order: 501,
    popupTemplate: {
      title: '{name}',
      content:
        '<div class="popup-text-container"><p class="popup-text-key">COUNTRY:</p> <p class="popup-text-value">{Country}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">LEGAL RECOGNITION:</p> <p class="popup-text-value">{Legal recognition}</p></div>',
    },
  },
  // Region and Country Data
  // Central Africa
  {
    id: proLayers.cameroonAgroIndustrialZonesID,
    group: 'region',
    subGroup: '',
    region: 'central-africa',
    country: 'Cameroon',
    countryCode: 'CMR',
    order: 600,
  },

  {
    id: proLayers.liberiaTreePlantationsByType,
    group: 'region',
    subGroup: 'land-cover',
    region: 'central-africa',
    country: 'Liberia',
    countryCode: 'LBR',
    order: 621,
    fields: [],
  },
  {
    id: proLayers.liberiaTreePlantationsBySpecies,
    group: 'region',
    subGroup: 'land-cover',
    region: 'central-africa',
    country: 'Liberia',
    countryCode: 'LBR',
    order: 622,
    fields: [],
  },

  // South America

  // Argentia - 630
  // Bolivia - 640
  {
    id: proLayers.brazilBiomesID,
    group: 'region',
    subGroup: '',
    region: 'south-america',
    country: 'Brazil',
    countryCode: 'BRA',
    order: 650,
    popupTemplate: {
      title: '{name}',
      content: '<p>AREA HA: {shape_Area}</p>',
    },
  },
  {
    id: proLayers.prodesDeforestationVizzBrazil,
    group: 'region',
    subGroup: 'forest-change',
    region: 'south-america',
    country: 'Brazil',
    countryCode: 'BRA',
    order: 652,
  },
  {
    id: proLayers.brazilTreeByTypeID,
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Brazil',
    countryCode: 'BRA',
    order: 654,
  },
  {
    id: proLayers.brazilTreeBySpeciesID,
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Brazil',
    countryCode: 'BRA',
    order: 655,
  },
  {
    id: proLayers.otbn,
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Argentina',
    countryCode: 'AR',
    order: 656,
  },
  {
    id: proLayers.argentineanNativeForestsLoss,
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Argentina',
    countryCode: 'AR',
    order: 657,
  },
  {
    id: 'colombia-tree-plantations-by-type', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Colombia',
    countryCode: 'COL',
    order: 661,
  },
  {
    id: 'colombia-tree-plantations-by-species', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Colombia',
    countryCode: 'COL',
    order: 662,
  },
  {
    id: 'peru-tree-plantations-by-type', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Peru',
    countryCode: 'PER',
    order: 671,
  },
  {
    id: 'peru-tree-plantations-by-species', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'south-america',
    country: 'Peru',
    countryCode: 'PER',
    order: 672,
  },

  // Southeast Asia
  {
    id: proLayers.landCoverSEAsiaID,
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Southeast Asia',
    countryCode: '',
    order: 680,
  },
  {
    id: 'cambodia-tree-plantations-by-type', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Cambodia',
    countryCode: 'KHM',
    order: 691,
  },
  {
    id: 'cambodia-tree-plantations-by-species', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Cambodia',
    countryCode: 'KHM',
    order: 692,
  },
  {
    id: proLayers.indonesiaForestMoratorium,
    group: 'region',
    subGroup: '',
    region: 'southeast-asia',
    country: 'Indonesia',
    countryCode: 'IDN',
    order: 701,
  },
  {
    id: proLayers.indonesiaLegalClass,
    group: 'region',
    subGroup: '',
    region: 'southeast-asia',
    country: 'Indonesia',
    countryCode: 'IDN',
    order: 702,
  },
  {
    id: proLayers.indonesiaPeatLands,
    group: 'region',
    subGroup: '',
    region: 'southeast-asia',
    country: 'Indonesia',
    countryCode: 'IDN',
    order: 704,
  },
  {
    id: proLayers.indoTreePlantationsType,
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Indonesia',
    countryCode: 'IDN',
    order: 708,
  },
  {
    id: proLayers.indoTreePlantationsSpecies,
    group: 'region',
    popupTemplate: {
      title: '{name}',
      // PLANTATION TYPE, species, percent plantation coverage, area ha
      content:
        '<div class="popup-text-container"><p class="popup-text-key">Arae HA:</p> <p class="popup-text-value">{shape_Area}</p></div>',
    },
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Indonesia',
    countryCode: 'IDN',
    order: 709,
  },
  {
    id: proLayers.indonesiaLandCover,
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Indonesia',
    countryCode: 'IDN',
    order: 710,
  },
  {
    id: 'malaysia-tree-plantations-by-type', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Malaysia',
    countryCode: 'MYS',
    order: 722,
    fields: [],
  },
  {
    id: 'malaysia-tree-plantations-by-species', // does not exist in api
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Malaysia',
    countryCode: 'MYS',
    order: 723,
    fields: [],
  },
];
