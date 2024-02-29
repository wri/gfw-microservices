import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { EventEmitter, PassThrough, Transform } from 'stream';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';
import { ApplyTimeframeFilter } from '../transform/apply.timeframe.filter';
import { ALERTS_LOCATION_LEVEL_DAILY, DATE_FORMAT_CSV } from '../shared/constants';
import * as fs from 'fs';
import { FeatureExpandDailyAlerts } from '../transform/feature.expand.daily.alerts';
import * as moment from 'moment/moment';
import { dictionary } from '../shared/alert.utils';

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

  addHistory(partialHistory: DashboardDataType[]) {
    partialHistory.forEach((data) => {
      const { gadmid, date } = data;
      const key = `${gadmid}_${date}`;
      if (!this.history[key]) {
        this.history[key] = data;
      } else {
        this.history[key].count += data.count;
      }
    });
  }

  getHistory(): Record<string, DashboardDataType> {
    return this.history;
  }
}

class EventEmitterTransform extends Transform {
  constructor(private eventEmitter: EventEmitter, private filters: AlertFieldsFileRequest) {
    super({ objectMode: true });
  }

  _transform(chunk: DashboardDataType, _, next) {
    this.eventEmitter.emit('addHistory', chunk);
    next();
  }
}
@Injectable()
export class AlertsLocationsHistoryService extends IPipeService {
  private readonly logger = new Logger(AlertsLocationsHistoryService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;
  private accumulateHistory: AccumulateHistory;
  private headers = [
    'List Name',
    'Location Name',
    'Alert Type',
    'Start Date',
    'End Date',
    'Date',
    '# of alerts for location',
  ];

  start(filters: AlertFieldsFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });
    this.accumulateHistory = new AccumulateHistory();
    this.organizeStream(filters);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${ALERTS_LOCATION_LEVEL_DAILY}.csv`,
      `${this.headers.join(',')}\n`
    );
  }
  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, startDate, endDate, selectedTimeframe, selectedAlert } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.inputStream
      .pipe(new AlertsGetLocationOrListData(false))
      .pipe(new ApplyTimeframeFilter(selectedTimeframe, selectedAlert, startDate, endDate))
      .pipe(new FeatureExpandDailyAlerts(selectedAlert))
      .pipe(new EventEmitterTransform(this.accumulateHistory, filters));
  }

  process(analysisData: DashboardDataType[]) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }
  async finish(filters: AlertFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);
    await this.writeAllData(this.inputStream);
    this.writeHistory(filters);
  }

  private writeHistory = (filters: AlertFieldsFileRequest) => {
    const accumulateHistory = this.accumulateHistory.getHistory();
    const { key, listName, startDate, endDate, selectedAlert } = filters;
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${ALERTS_LOCATION_LEVEL_DAILY}.csv`,
      `${this.headers.join(',')}\n`
    );

    const alertTypeText = dictionary.alertType_alertText[selectedAlert];

    Object.keys(accumulateHistory).forEach((locationAndDateKey) => {
      const { date, location_name, count } = accumulateHistory[locationAndDateKey];

      if (count > 0) {
        const data = [
          listName,
          location_name,
          alertTypeText,
          moment(startDate).format(DATE_FORMAT_CSV),
          moment(endDate).format(DATE_FORMAT_CSV),
          moment(date).format(DATE_FORMAT_CSV),
          count,
        ];

        fs.appendFileSync(
          `/tmp/wri-${key}/${listName}_${ALERTS_LOCATION_LEVEL_DAILY}.csv`,
          `${data.join(',')}\n`
        );
      }
    });
  };
}
