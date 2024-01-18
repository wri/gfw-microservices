import * as moment from 'moment';

// import  { groupBy } from 'lodash';
// import { AnalysisDashboard, AnalysisDashboardDTO } from '@wri-monorepos/sql';

const DATE_FORMAT_DAY = 'YYYY-MM-DD';
// const DATE_FORMAT_WEEK = 'YYYY-w';
const DATE_FORMAT_MONTH = 'YYYY-MM';
const DATE_FORMAT_CSV = 'DD MMM YYYY';

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

const SELECTED_TIMEFRAME_GLAD_MAPPING = {
  WEEK: 'glad_alerts_daily',
  MONTH: 'glad_alerts_weekly',
  QUARTER: 'glad_alerts_monthly',
  YEAR: 'glad_alerts_monthly',
};

const SELECTED_TIMEFRAME_VIIRS_MAPPING = {
  DAY: 'viirs_alerts_daily',
  WEEK: 'viirs_alerts_daily',
};

const getTimeframeBoundaries = (selectedTimeframe: string): { start: string; end: string } => {
  switch (selectedTimeframe) {
    case 'DAY': {
      return {
        start: moment().subtract(1, 'days').format(DATE_FORMAT_CSV),
        end: moment().endOf('day').format(DATE_FORMAT_CSV),
      };
    }
    case 'WEEK': {
      return {
        start: moment().subtract(1, 'week').format(DATE_FORMAT_CSV),
        end: moment().subtract(1, 'day').format(DATE_FORMAT_CSV),
      };
    }
    case 'MONTH': {
      return {
        start: moment().subtract(1, 'month').startOf('month').format(DATE_FORMAT_CSV),
        end: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT_CSV),
      };
    }
    case 'QUARTER': {
      return {
        start: moment().subtract(3, 'month').startOf('month').format(DATE_FORMAT_CSV),
        end: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT_CSV),
      };
    }
    case 'YEAR': {
      return {
        start: moment().subtract(12, 'month').startOf('month').format(DATE_FORMAT_CSV),
        end: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT_CSV),
      };
    }
  }
};

const getDashboardDaysRange = (numberOfDays = 1): string[] => {
  return Array(numberOfDays)
    .fill('')
    .map((value, index) =>
      moment()
        .add(-numberOfDays + index, 'day')
        .format(DATE_FORMAT_DAY)
    );
};

const getDashboardMonthlyRange = (numberOfMonths: number) => {
  return Array(numberOfMonths)
    .fill('')
    .map((value, index) =>
      moment()
        .add(-numberOfMonths + index, 'month')
        .format(DATE_FORMAT_MONTH)
    );
};

const DASHBOARD_ONE_DAY_RANGE = getDashboardDaysRange();
const DASHBOARD_DAYS_RANGE = getDashboardDaysRange(7);
const DASHBOARD_YEAR_RANGE = getDashboardMonthlyRange(12);
const DASHBOARD_QUARTER_RANGE = getDashboardMonthlyRange(3);
const DASHBOARD_MONTH_RANGE = getDashboardMonthlyRange(1);

const TIMEFRAME_RANGE = {
  DAY: DASHBOARD_ONE_DAY_RANGE,
  WEEK: DASHBOARD_DAYS_RANGE,
  MONTH: DASHBOARD_MONTH_RANGE,
  QUARTER: DASHBOARD_QUARTER_RANGE,
  YEAR: DASHBOARD_YEAR_RANGE,
};

/*const getGladMonthlyYear = (feature: AnalysisDashboardDTO) => {
  return feature.gladAlertsMonthly.filter((date) => {
    return DASHBOARD_YEAR_RANGE.includes(date.day);
  });
}*/

/*export function getViirsGrouped(feature: AnalysisDashboardDTO, momentStart, momentEnd) {
  return groupBy(feature.viirsAlertsDaily, (alert) => {
    const alertMoment = moment(alert.day);
    if (alertMoment.isBefore(momentStart) || alertMoment.isAfter(momentEnd)) {
      return 'delete';
    } else {
      return alert.day;
    }
  });
}*/
const getTimeframeProperty = (selectedAlert: string, selectedTimeframe: string) => {
  const alertMapping =
    selectedAlert === 'GLAD' ? SELECTED_TIMEFRAME_GLAD_MAPPING : SELECTED_TIMEFRAME_VIIRS_MAPPING;
  return alertMapping[selectedTimeframe];
};

const checkForAlerts = (val, selectedTimeframe: string, timeframeProperty: string) => {
  return val[timeframeProperty].some((date) => {
    return TIMEFRAME_RANGE[selectedTimeframe].includes(date.day);
  });
};

const checkForNoAlerts = (val, selectedTimeframe: string, timeframeProperty: string) => {
  return val[timeframeProperty].every((date) => {
    return !TIMEFRAME_RANGE[selectedTimeframe].includes(date.day);
  });
};

const getNumberOfAlerts = (adminUnitData, selectedTimeframe: string, timeframeProperty: string) => {
  return adminUnitData
    .map((l) => l.properties[timeframeProperty])
    .map((l) =>
      l.reduce((total, current) => {
        return TIMEFRAME_RANGE[selectedTimeframe].includes(current.day)
          ? total + current.count
          : total;
      }, 0)
    )
    .reduce((totalFeatures, current) => totalFeatures + current, 0);
};

const getSelectedTimeframeStartEndGroupings = (selectedTimeframe: string) => {
  const selectedTimeframe_StartEndGroupings = [];
  const selectedTimePeriod = dictionary.timeframe_dateGroupBy[selectedTimeframe];
  const { start, end } = getTimeframeBoundaries(selectedTimeframe);
  const startMoment = moment(start);
  const endMoment = moment(end);

  let currentMoment = startMoment;
  while (currentMoment.isSameOrBefore(endMoment)) {
    selectedTimeframe_StartEndGroupings.push([
      currentMoment.startOf(selectedTimePeriod).format(DATE_FORMAT_CSV),
      currentMoment.endOf(selectedTimePeriod).format(DATE_FORMAT_CSV),
    ]);
    currentMoment = currentMoment.add(1, selectedTimePeriod).startOf('day');
  }

  return selectedTimeframe_StartEndGroupings;
};

export {
  getTimeframeBoundaries,
  getDashboardDaysRange,
  getDashboardMonthlyRange,
  getSelectedTimeframeStartEndGroupings,
  getNumberOfAlerts,
  checkForNoAlerts,
  checkForAlerts,
  getTimeframeProperty,
  // getGladMonthlyYear,
  // getViirsGrouped,
  TIMEFRAME_RANGE,
};
