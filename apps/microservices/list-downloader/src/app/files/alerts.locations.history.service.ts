import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { PassThrough } from 'stream';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';
import { ApplyTimeframeFilter } from '../transform/apply.timeframe.filter';
import { AlertsFilterData } from '../transform/alerts.filter.data';
import * as moment from 'moment/moment';
import { ALERTS_LOCATION_LEVEL_DAILY, DATE_FORMAT_CSV } from '../shared/constants';
import { ConvertObject2CSV } from '../transform/convert.object.2.csv';
import * as fs from 'fs';
import { finished } from 'stream/promises';
import { FeatureExpandDailyAlerts } from '../transform/feature.expand.daily.alerts';

@Injectable()
export class AlertsLocationsHistoryService extends IPipeService {
  private readonly logger = new Logger(AlertsLocationsHistoryService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;
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

    this.organizeStream(filters);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${ALERTS_LOCATION_LEVEL_DAILY}.csv`,
      `${this.headers.join(',')}\n`
    );
  }
  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, key, listName, startDate, endDate, selectedTimeframe, selectedAlert } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(
      `/tmp/wri-${key}/${listName}_${ALERTS_LOCATION_LEVEL_DAILY}.csv`,
      {
        flags: 'a',
      }
    );

    this.inputStream
      .pipe(new AlertsGetLocationOrListData(false))
      .pipe(new ApplyTimeframeFilter(selectedTimeframe, selectedAlert, startDate, endDate))
      .pipe(new FeatureExpandDailyAlerts(selectedAlert))
      .pipe(
        new AlertsFilterData(
          selectedAlert,
          selectedTimeframe,
          moment(startDate).format(DATE_FORMAT_CSV),
          moment(endDate).format(DATE_FORMAT_CSV),
          listName,
          ALERTS_LOCATION_LEVEL_DAILY
        )
      )
      .pipe(new ConvertObject2CSV(this.headers))
      .pipe(this.fileStream);
  }

  process(analysisData: DashboardDataType[]) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }
  async finish(filters: AlertFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    this.fileStream.removeAllListeners();
    this.fileStream.destroy();
  }
}
