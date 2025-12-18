import { Injectable, Logger, Scope } from '@nestjs/common';
import { AlertFieldsFileRequest, CountObj, DashboardDataType } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { EventEmitter, PassThrough, Transform } from 'stream';
import * as fs from 'fs';
import {
  parse,
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  isWithinInterval,
  isBefore,
  isAfter,
  isEqual,
  differenceInCalendarDays,
  subDays,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { ApplyTimeframeFilter } from '../transform/apply.timeframe.filter';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';
import { dictionary } from '../shared/alert.utils';
import { isEmpty, sortBy } from 'lodash';
import { DATE_FORMAT, DATE_FORMAT_CSV } from '../shared/constants';

interface AlertHistory {
  start: string;
  total: number;
}

class AccumulateHistory extends EventEmitter {
  private history = {};

  constructor() {
    super();
    this.on('addHistory', this.addHistory);
    this.on('cleanHistory', this.cleanAccumulateHistory);
  }

  cleanAccumulateHistory() {
    this.history = {};
  }

  addHistory(partialHistory: AlertHistory[]) {
    partialHistory.forEach(({ start, total }) => {
      if (!this.history[start]) {
        this.history[start] = 0;
      }
      this.history[start] += total;
    });
  }

  getHistory(): Record<string, number> {
    return this.history;
  }
}

class EventEmitterTransform extends Transform {
  constructor(private eventEmitter: EventEmitter, private filters: AlertFieldsFileRequest) {
    super({ objectMode: true });
  }

  getSelectedTimeframeStartEndGroupings(
    selectedTimeframe: string,
    startDate: string,
    endDate: string
  ) {
    const selectedTimeframe_StartEndGroupings = [];
    const selectedTimePeriod = dictionary.timeframe_dateGroupBy[selectedTimeframe];
    // Parse dates as UTC to avoid timezone issues
    const startMoment = new Date(startDate + 'T00:00:00.000Z');
    const endMoment = new Date(endDate + 'T00:00:00.000Z');

    // For UTC operations, we need helpers that work with UTC dates
    // Since startOfDay/Week/Month treat dates as local time, we need to work around this
    const addFn =
      selectedTimePeriod === 'day' ? addDays : selectedTimePeriod === 'week' ? addWeeks : addMonths;

    let currentMoment = startMoment;
    while (isBefore(currentMoment, endMoment) || isEqual(currentMoment, endMoment)) {
      // For period calculation, work in UTC
      const periodStart = currentMoment;
      let periodEnd;
      
      if (selectedTimePeriod === 'day' || selectedTimePeriod === 'week') {
        // For day/week, start and end are the same
        periodEnd = currentMoment;
      } else if (selectedTimePeriod === 'month') {
        // For month, end is the last day of the month
        // Get next month, subtract 1 day to get last day of current month
        const nextMonth = addMonths(currentMoment, 1);
        periodEnd = subDays(nextMonth, 1);
      }
      
      selectedTimeframe_StartEndGroupings.push([
        formatInTimeZone(periodStart, 'UTC', DATE_FORMAT_CSV),
        formatInTimeZone(periodEnd, 'UTC', DATE_FORMAT_CSV),
      ]);
      currentMoment = addFn(currentMoment, 1);
    }

    return selectedTimeframe_StartEndGroupings;
  }

  calculateAlertHistoryForList(
    chunk: DashboardDataType,
    selectedAlert: string,
    selectedTimeframe: string,
    startDate: string,
    endDate: string
  ) {
    const selectedTimeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
    const selectedTimeframe_StartEndGroupings = this.getSelectedTimeframeStartEndGroupings(
      selectedTimeframe,
      startDate,
      endDate
    );

    let filtered: CountObj[] = [];
    if (selectedAlert === 'VIIRS') {
      filtered = Object.values(chunk[selectedTimeframeProperty]).reduce(
        (acc: AlertHistory[], val: AlertHistory[]) => acc.concat(val),
        []
      ) as CountObj[];
    } else {
      filtered = chunk[selectedTimeframeProperty].filter((f) => !isEmpty(f)) as CountObj[];
    }

    return selectedTimeframe_StartEndGroupings.map((dateBounds) => {
      const [startBound, endBound] = dateBounds;
      // Parse dates using same approach as Moment.js did - parse formatted strings
      const dateStart = parse(startBound, DATE_FORMAT_CSV, new Date());
      const dateEnd = parse(endBound, DATE_FORMAT_CSV, new Date());
      
      let total = 0;
      filtered.forEach((countObj) => {
        const { count, day } = countObj;

        // Parse alert day - monthly data uses 'yyyy-MM' format, daily data uses 'yyyy-MM-dd'
        // Detect format based on string length
        const dayFormat = day.length === 7 ? 'yyyy-MM' : DATE_FORMAT;
        const currentM = parse(day, dayFormat, new Date());
        
        // Use same logic as original: isSameOrAfter && isSameOrBefore
        if ((isAfter(currentM, dateStart) || isEqual(currentM, dateStart)) &&
            (isBefore(currentM, dateEnd) || isEqual(currentM, dateEnd))) {
          total += count;
        }
      });
      return {
        start: startBound,
        total,
      };
    });
  }

  _transform(chunk: DashboardDataType, _, next) {
    const { selectedAlert, selectedTimeframe, startDate, endDate } = this.filters;
    const total = this.calculateAlertHistoryForList(
      chunk,
      selectedAlert,
      selectedTimeframe,
      startDate,
      endDate
    );
    this.eventEmitter.emit('addHistory', total);
    next();
  }
}

@Injectable({
  scope: Scope.REQUEST,
})
export class AlertsHistoryService extends IPipeService {
  private readonly logger = new Logger(AlertsHistoryService.name);
  private inputStream: PassThrough;
  private accumulateHistory: AccumulateHistory;
  private headers = [
    'List Name',
    'Alert Type',
    'Timeframe',
    'Number of Alerts',
    'Start Date',
    'End Date',
  ];

  start(filters: AlertFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    this.accumulateHistory = new AccumulateHistory();
    this.organizeStream(filters);

    this.accumulateHistory.emit('cleanHistory');
  }

  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, startDate, endDate, selectedTimeframe, selectedAlert } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.inputStream
      .pipe(new AlertsGetLocationOrListData(true))
      .pipe(new ApplyTimeframeFilter(selectedTimeframe, selectedAlert, startDate, endDate))
      .pipe(new EventEmitterTransform(this.accumulateHistory, filters));
  }

  process(analysisData: DashboardDataType[]) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }

  async finish(filters: AlertFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);
    await this.writeAllData(this.inputStream);
    this.writeSummary(filters);
  }

  private writeSummary(filters: AlertFieldsFileRequest) {
    const { key, listName, selectedAlert, selectedTimeframe } = filters;

    const selectedAlertText = dictionary.alertType_alertText[selectedAlert];
    const filePath = `/tmp/wri-${key}/${listName}_AlertsHistory.csv`;

    fs.writeFileSync(filePath, `${this.headers.join(',')}\n`);

    const momentSort = (a: AlertHistory, b: AlertHistory) => {
      const momentA = parse(a.start, DATE_FORMAT_CSV, new Date());
      const momentB = parse(b.start, DATE_FORMAT_CSV, new Date());
      return differenceInCalendarDays(momentA, momentB);
    };

    const accumulateHistory = this.accumulateHistory.getHistory();
    const groupedTimeframeArray = Object.entries(accumulateHistory).map(([start, total]) => {
      return { start, total };
    });
    const sorted = groupedTimeframeArray.sort(momentSort);

    const endDateSchema = {
      Integrated: {
        DAY: 'DAY',
        WEEK: 'DAY',
        MONTH: 'MONTH',
        QUARTER: 'MONTH',
        YEAR: 'MONTH',
      },
      VIIRS: {
        DAY: 'DAY',
        WEEK: 'DAY',
      },
    };

    const rows = sorted.map((timeframe) => {
      const { start, total } = timeframe;
      const startDate = parse(start, DATE_FORMAT_CSV, new Date());
      const period = endDateSchema[selectedAlert][selectedTimeframe];
      const addFn = period === 'DAY' ? addDays : addMonths;
      const endDate = formatInTimeZone(subDays(addFn(startDate, 1), 1), 'UTC', DATE_FORMAT_CSV);

      return [listName, selectedAlertText, selectedTimeframe, total, start, endDate];
    });

    fs.appendFileSync(filePath, `${sortBy(rows, 1).join('\n')}`);
  }
}
