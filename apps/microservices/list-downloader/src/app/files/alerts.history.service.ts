import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, CountObj, DashboardDataType } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { EventEmitter, PassThrough, Transform } from 'stream';
import * as fs from 'fs';
import * as moment from 'moment';
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
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    let currentMoment = startMoment;
    while (currentMoment.isSameOrBefore(endMoment)) {
      selectedTimeframe_StartEndGroupings.push([
        currentMoment.startOf(selectedTimePeriod).format(DATE_FORMAT_CSV),
        currentMoment.endOf(selectedTimePeriod).format(DATE_FORMAT_CSV),
      ]);
      currentMoment = currentMoment.add(1, selectedTimePeriod).startOf('day');
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
      const dateStart = moment(startBound, DATE_FORMAT_CSV);
      const dateEnd = moment(endBound, DATE_FORMAT_CSV);
      let total = 0;
      filtered.forEach((countObj) => {
        const { count, day } = countObj;

        const currentM = moment(day, DATE_FORMAT);
        if (currentM.isSameOrAfter(dateStart) && currentM.isSameOrBefore(dateEnd)) {
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

@Injectable()
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
      const momentA = moment(a.start, DATE_FORMAT_CSV);
      const momentB = moment(b.start, DATE_FORMAT_CSV);
      return momentA.diff(momentB);
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
      const endDate = moment(start, DATE_FORMAT_CSV)
        .add(1, endDateSchema[selectedAlert][selectedTimeframe])
        .subtract(1, 'days')
        .format(DATE_FORMAT_CSV);

      return [listName, selectedAlertText, selectedTimeframe, total, start, endDate];
    });

    fs.appendFileSync(filePath, `${sortBy(rows, 1).join('\n')}`);
  }
}
