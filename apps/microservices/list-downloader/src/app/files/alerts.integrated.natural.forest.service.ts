import { Injectable, Logger } from '@nestjs/common';
import { IPipeService } from '../pipe/i.pipe.service';
import { AlertFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { PassThrough, TransformCallback, Transform } from 'stream';
import * as fs from 'fs';
import { ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER } from '../shared/constants';
import { finished } from 'stream/promises';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';
import { IntegratedAlertsNaturalForest } from '../transform/integrated.alerts.natural.forest';
import { FilterTimeframeIntegratedAlerts } from '../transform/filter.timeframe.integrated.alerts';
import { FormatNumber } from '../transform/format.number';
import { ConvertObject2CSV } from '../transform/convert.object.2.csv';

import { EventEmitter } from 'events';

export class TotalAccumulator {
  private total: number;

  constructor(eventEmitter: EventEmitter) {
    this.total = 0;
    eventEmitter.on('count', () => this.total++);
    eventEmitter.on('clearTotal', () => (this.total = 0));
  }

  getTotal(): number {
    return this.total;
  }
}

export class LocationCounter extends Transform {
  private locations: Set<string>;
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    super({ objectMode: true });
    this.locations = new Set<string>();
    this.eventEmitter = eventEmitter;
  }

  _transform(
    chunk: DashboardDataType,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    try {
      const hasData = this.hasIntegratedData(chunk);
      if (chunk.location_name && !this.locations.has(chunk.location_name) && hasData) {
        this.locations.add(chunk.location_name);
        this.eventEmitter.emit('count', 1);
      }
      callback(null, chunk); // Pass the chunk along the stream
    } catch (err) {
      callback(err);
    }
  }

  hasIntegratedData(data: DashboardDataType): boolean {
    const {
      integratedAlertsDailyJrcHighest,
      integratedAlertsDailyJrcHigh,
      integratedAlertsDailyJrcNominal,
      integratedAlertsDailySbtnHighest,
      integratedAlertsDailyAllNominal,
      integratedAlertsDailyAllHigh,
      integratedAlertsDailyAllHighest,
      integratedAlertsDailySbtnNominal,
      integratedAlertsDailySbtnHigh,
    } = data;
    return (
      Object.keys(JSON.parse(integratedAlertsDailyAllNominal)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailyAllHigh)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailyAllHighest)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailySbtnNominal)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailySbtnHigh)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailySbtnHighest)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailyJrcNominal)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailyJrcHigh)).length > 0 ||
      Object.keys(JSON.parse(integratedAlertsDailyJrcHighest)).length > 0
    );
  }
}

@Injectable()
export class AlertsIntegratedNaturalForestService extends IPipeService {
  private readonly logger = new Logger(AlertsIntegratedNaturalForestService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;
  private suffix = 'IntegratedAlerts_NaturalForest_Daily';
  private eventEmitter = new EventEmitter();
  private totalAccumulator = new TotalAccumulator(this.eventEmitter);

  start(filters: AlertFieldsFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    this.organizeStream(filters);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${this.suffix}.csv`,
      `${Object.values(ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER)
        .map((header) => header.name)
        .join(',')}\n`
    );
  }

  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, startDate, endDate, key, listName } = filters;

    this.eventEmitter.emit('clearTotal');

    const inputColumns: string[] = [
      'integratedAlertsDailyAllNominal',
      'integratedAlertsDailyAllHigh',
      'integratedAlertsDailyAllHighest',
      'integratedAlertsDailySbtnNominal',
      'integratedAlertsDailySbtnHigh',
      'integratedAlertsDailySbtnHighest',
      'integratedAlertsDailyJrcNominal',
      'integratedAlertsDailyJrcHigh',
      'integratedAlertsDailyJrcHighest',
    ];

    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(`/tmp/wri-${key}/${listName}_${this.suffix}.csv`, {
      flags: 'a',
    });

    this.inputStream
      .pipe(new AlertsGetLocationOrListData(false))
      .pipe(new FilterTimeframeIntegratedAlerts(inputColumns, startDate, endDate))
      .pipe(new LocationCounter(this.eventEmitter))
      .pipe(new IntegratedAlertsNaturalForest(listName, startDate, endDate))
      .pipe(new FormatNumber())
      .pipe(new ConvertObject2CSV(Object.keys(ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER)))
      .pipe(this.fileStream);
  }

  process(analysisData: DashboardDataType[]) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }
  async finish(filters: AlertFieldsFileRequest) {
    const { listName, listId, startDate, endDate, key } = filters;
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
    this.logger.log(`(${listId}) - Finished to process result data`);
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    this.fileStream.removeAllListeners();
    this.fileStream.destroy();
    fs.appendFileSync(
      `/tmp/wri-${key}/${listName}_${this.suffix}.csv`,
      `${listName},Total locations,Deforestation (Integrated Alerts),${formattedStartDate},${formattedEndDate},,,,,,${this.totalAccumulator.getTotal()}\n`
    );
  }
}
