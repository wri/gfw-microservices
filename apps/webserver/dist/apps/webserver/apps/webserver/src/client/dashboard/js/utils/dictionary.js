const dictionary = {
  // Dashboard zoom level - admin basemap mapserver layer id
  zoomLevel_basemapLayerId: {
    0: 6,
    1: 5,
    2: 4,
    3: 4,
  },
  // Dashboard zoom level - admin query id
  zoomLevel_adminQueryId: {
    0: 9,
    1: 8,
    2: 7,
  },
  // Dashboard zoom level - admin filter
  zoomLevel_adminFilter: {
    0: '',
    1: 'Country',
    2: 'State',
    3: 'Sub State',
  },
  // Dashboard zoom level - admin grouping
  zoomLevel_adminGroupBy: {
    0: 'Country',
    1: 'State',
    2: 'Sub State',
    3: '',
  },
  // Dashboard zoom level - gadmid grouping
  zoomLevel_gadmidGroupBy: {
    0: 'gadmid_0',
    1: 'gadmid_1',
    2: 'gadmid_2',
    3: '',
  },
  zoomLevel_scale: {
    0: 98000000,
    1: 2500000,
    2: 1000000,
    3: 250000,
  },
  // Alerts type - coverage property
  alertType_featureCoverageProperty: {
    GLAD: 'gladAlerts',
    VIIRS: 'fireAlerts',
  },
  // Alerts type - feature raw data property
  alertType_featureDataProperty: {
    GLAD: 'glad',
    VIIRS: 'fire',
  },
  // Alerts type - feature timeframe property
  alertType_featureTimeframeProperty: {
    GLAD: 'gladTimeframe',
    VIIRS: 'fireTimeframe',
  },
  // Alerts type - Title Text
  alertType_alertText: {
    GLAD: 'Deforestation (Integrated Alerts)',
    VIIRS: 'FIRES (VIIRS)',
  },
  // Timeframe - dateGrouping
  timeframe_dateGroupBy: {
    DAY: 'day',
    WEEK: 'day',
    MONTH: 'month',
    QUARTER: 'month',
    YEAR: 'month',
  },
  // Timeframe - moment format
  timeframe_momentFormat: {
    WEEK: 'DD MMM YYYY',
    MONTH: 'DD MMM YYYY',
    QUARTER: 'MMM',
    YEAR: 'MMM',
  },
};

module.exports = dictionary;
