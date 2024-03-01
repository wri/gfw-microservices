export const COLUMN_LOCATION_NAME = 'location_name';
export const COLUMN_SUB_STATE = 'Sub State';
export const COLUMN_STATE = 'State';
export const COLUMN_COUNTRY = 'Country';

export const dictionary = {
  alertType_featureCoverageProperty: {
    Integrated: 'gladAlerts',
    VIIRS: 'fireAlerts',
  },
  // Alerts type - feature raw data property
  alertType_featureDataProperty: {
    Integrated: 'glad',
    VIIRS: 'fire',
  },
  // Alerts type - feature timeframe property
  alertType_featureTimeframeProperty: {
    Integrated: 'gladTimeframe',
    VIIRS: 'fireTimeframe',
  },
  // Alerts type - Title Text
  alertType_alertText: {
    Integrated: 'Deforestation (Integrated Alerts)',
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
