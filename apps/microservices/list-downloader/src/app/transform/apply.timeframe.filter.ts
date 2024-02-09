import { Transform } from 'stream';
import * as moment from 'moment';
import {
  getGladDaily,
  getGladMonthlyMonth,
  getGladMonthlyQuarter,
  getGladMonthlyYear,
  getViirsGrouped,
} from '../parser/alerts.parser';
import { DashboardDataType } from '@wri-monorepos/sql';
import {
  SELECTED_TIMEFRAME_MONTH,
  SELECTED_TIMEFRAME_QUARTER,
  SELECTED_TIMEFRAME_WEEK,
  SELECTED_TIMEFRAME_YEAR,
} from '../shared/constants';

export class ApplyTimeframeFilter extends Transform {
  constructor(
    private readonly selectedTimeframe: string,
    private readonly startDate: string,
    private readonly endDate: string
  ) {
    super({ objectMode: true });
  }

  _transform(data: DashboardDataType, _, next) {
    const momentStart = moment(this.startDate);
    const momentEnd = moment(this.endDate);
    let groupedGlad = [];

    // Week timeframe
    if (
      this.selectedTimeframe === SELECTED_TIMEFRAME_WEEK &&
      Object.prototype.hasOwnProperty.call(data, 'glad_alerts_daily') &&
      data.glad_alerts_daily.length > 0
    ) {
      groupedGlad = getGladDaily(data, momentStart, momentEnd);
    }

    // Month timeframe
    if (
      this.selectedTimeframe === SELECTED_TIMEFRAME_MONTH &&
      Object.prototype.hasOwnProperty.call(data, 'glad_alerts_monthly') &&
      data.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyMonth(data, momentStart, momentEnd);
    }

    // Quarter timeframe
    if (
      this.selectedTimeframe === SELECTED_TIMEFRAME_QUARTER &&
      Object.prototype.hasOwnProperty.call(data, 'glad_alerts_monthly') &&
      data.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyQuarter(data, momentEnd);
    }

    // Year timeframe
    if (
      this.selectedTimeframe === SELECTED_TIMEFRAME_YEAR &&
      Object.prototype.hasOwnProperty.call(data, 'glad_alerts_monthly') &&
      data.glad_alerts_monthly.length > 0
    ) {
      groupedGlad = getGladMonthlyYear(data, momentEnd);
    }

    const groupedViirs = getViirsGrouped(data, momentStart, momentEnd);

    delete groupedViirs.delete;
    data.gladTimeframe = groupedGlad;
    data.fireTimeframe = groupedViirs;
    return next(null, data);
  }
}
