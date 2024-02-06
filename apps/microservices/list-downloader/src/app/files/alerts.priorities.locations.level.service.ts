import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { PassThrough } from 'stream';
import * as fs from 'fs';
import { ApplyTimeframeFilter } from '../transform/apply.timeframe.filter';
import { FeatureAlertTotal } from '../transform/feature.alert.total';
import { dictionary } from '../shared/alert.utils';
import {
  ALERTS_PRIORITIES_LOCATION_LEVEL,
  AlertsFilterData,
} from '../transform/alerts.filter.data';
import { finished } from 'stream/promises';
import { ConvertObject2CSV } from '../transform/convert.object.2.csv';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';

@Injectable()
export class AlertsPrioritiesLocationsLevelService extends IPipeService {
  private readonly logger = new Logger(AlertsPrioritiesLocationsLevelService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;
  private headers = [
    'List Name',
    'Location Name',
    'Sub State',
    'State',
    'Country',
    'Alert Type',
    'Timeframe',
    'Start Date',
    'End Date',
    '# of Location Level Alerts',
  ];

  async start(filters: AlertFieldsFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    this.organizeStream(filters);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${ALERTS_PRIORITIES_LOCATION_LEVEL}.csv`,
      `${this.headers.join(',')}\n`
    );
  }

  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, key, listName, startDate, endDate, selectedTimeframe, selectedAlert } = filters;
    this.inputStream.removeAllListeners();

    const timeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.fileStream = fs.createWriteStream(
      `/tmp/wri-${key}/${listName}_${ALERTS_PRIORITIES_LOCATION_LEVEL}.csv`,
      {
        flags: 'a',
      }
    );

    this.inputStream
      .pipe(new AlertsGetLocationOrListData())
      .pipe(new ApplyTimeframeFilter(selectedTimeframe, startDate, endDate))
      .pipe(new FeatureAlertTotal(timeframeProperty, selectedAlert))
      .pipe(
        new AlertsFilterData(
          selectedAlert,
          selectedTimeframe,
          startDate,
          endDate,
          listName,
          ALERTS_PRIORITIES_LOCATION_LEVEL
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
