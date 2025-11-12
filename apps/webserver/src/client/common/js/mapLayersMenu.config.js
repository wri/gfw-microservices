import { proLayers } from './proLayers.config';
import featureFlags from '../../../utils/general.utils';

const { isDegradedPastureLayerAvailable } = featureFlags;

const forestChangeLayers = [
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
    id: proLayers.integratedDeforestationAlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 107,
  },
  {
    id: proLayers.disturbanceAlertsDriversId,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 108,
  },
  {
    id: proLayers.globalVegetationDisturbanceAlertsId,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 109,
  },
  {
    id: proLayers.gladLGeographicCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 110,
  },

  {
    id: proLayers.gladAlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 111,
  },
  {
    id: proLayers.gladS2GeographicCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 112,
  },
  {
    id: proLayers.gladS2AlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 113,
  },
  {
    id: proLayers.raddAlertsID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 114,
  },
  {
    id: proLayers.raddCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    ignored: true,
    order: 115,
  },
  {
    id: proLayers.integratedAlertsGeographicCoverageID,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    order: 116,
    ignored: true,
  },
  {
    id: proLayers.viirsActiveFiresID,
    group: 'forest-change',
    subGroup: 'fire-alerts',
    order: 117,
    popupTemplate: {
      title: null,
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
  {
    id: proLayers.disturbanceAlertsDriversGeographicCoverageId,
    group: 'forest-change',
    subGroup: 'deforestation-alerts',
    ignored: true,
    order: 118,
  },
];

const landCoverLayers = [
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
    id: proLayers.sBTNNaturalForest,
    group: 'land-cover',
    order: 211,
  },
  {
    id: proLayers.jrcGlobalForestCover,
    group: 'land-cover',
    order: 212,
  },
];

const landUseLayers = [
  {
    id: proLayers.oilPalmConcessions,
    group: 'land-use',
    subGroup: 'concessions',
    order: 210,
    popupTemplate: {
      title: '{name}',
      content:
        '<div class="popup-text-container"><p class="popup-text-key">Company:</p> <p class="popup-text-value">{company}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">Country:</p> <p class="popup-text-value">{country}</p></div>' +
        '<div class="popup-text-container"><p class="popup-text-key">Area:</p> <p class="popup-text-value">{area_ha}</p></div>',
    },
    fields: [],
  },
  {
    id: proLayers.rspoConcessions,
    group: 'land-use',
    subGroup: 'concessions',
    order: 300,
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
    id: proLayers.pastureRecoveryPotential,
    group: 'land-use',
    subGroup: isDegradedPastureLayerAvailable ? 'production' : 'crop-production',
    order: 301,
  },
  {
    id: proLayers.soyPlantedArea,
    group: 'land-use',
    subGroup: isDegradedPastureLayerAvailable ? 'production' : 'crop-production',
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
];

const conservationLayers = [
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
];

const peopleLayers = [
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
];

const regionLayers = [
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
    id: proLayers.landCoverSEAsiaID,
    group: 'region',
    subGroup: 'land-cover',
    region: 'southeast-asia',
    country: 'Southeast Asia',
    countryCode: '',
    order: 680,
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
    id: proLayers.indoTreePlantationsSpecies,
    group: 'region',
    popupTemplate: {
      title: '{name}',
      content:
        '<div class="popup-text-container"><p class="popup-text-key">Area HA:</p> <p class="popup-text-value">{shape_Area}</p></div>',
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
    id: proLayers.colombiaFronteraAgricola,
    group: 'region',
    subGroup: '',
    region: 'south-america',
    country: 'Colombia',
    countryCode: 'IDN',
    order: 610,
  },
];

export const mapLayersMenu = [
  ...forestChangeLayers,
  ...landCoverLayers,
  ...landUseLayers,
  ...conservationLayers,
  ...peopleLayers,
  ...regionLayers,
];
