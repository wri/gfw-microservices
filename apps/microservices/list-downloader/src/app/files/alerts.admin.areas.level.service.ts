import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { PassThrough } from 'stream';
import * as fs from 'fs';
import * as moment from 'moment';
import { dictionary } from '../shared/alert.utils';
import { ApplyTimeframeFilter } from '../transform/apply.timeframe.filter';
import { FeatureAlertTotal } from '../transform/feature.alert.total';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';
import {
  AlertsEventEmitterTransform,
  FeatureDensityForAdminLevelAggregator,
} from '../transform/alerts.event.emitter';
import { DATE_FORMAT_CSV } from '../shared/constants';

@Injectable()
export class AlertsAdminAreasLevelService extends IPipeService {
  private readonly logger = new Logger(AlertsAdminAreasLevelService.name);
  private inputStream: PassThrough;
  private featureDensityForAdminLevelAggregator: FeatureDensityForAdminLevelAggregator;
  private headers = [
    'List Name',
    'Sub State',
    'State',
    'Country',
    'Alert Type',
    'Timeframe',
    'Start Date',
    'End Date',
    '# of Sub State Level Alerts',
    '# of State Level Alerts',
    '# of Country Level Alerts',
  ];

  start(filters: AlertFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    this.featureDensityForAdminLevelAggregator = new FeatureDensityForAdminLevelAggregator();
    this.organizeStream(filters);
    this.featureDensityForAdminLevelAggregator.emit('cleanFeatureDensityForAdminLevel');
  }

  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, startDate, endDate, selectedTimeframe, selectedAlert } = filters;
    this.inputStream.removeAllListeners();

    const timeframeProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.inputStream
      .pipe(new AlertsGetLocationOrListData(true))
      .pipe(new ApplyTimeframeFilter(selectedTimeframe, selectedAlert, startDate, endDate))
      .pipe(new FeatureAlertTotal(timeframeProperty, selectedAlert))
      .pipe(new AlertsEventEmitterTransform(this.featureDensityForAdminLevelAggregator));
  }

  process(analysisData: DashboardDataType[]) {
    analysisData?.forEach((data) => this.inputStream.write(data));
  }
  async finish(filters: AlertFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Finished to process result data`);
    await this.writeAllData(this.inputStream);

    this.writeAllCountData(filters);
  }

  private writeAllCountData(filters: AlertFieldsFileRequest) {
    const { key, listName, selectedAlert, startDate, endDate, selectedTimeframe } = filters;

    const filePath = `/tmp/wri-${key}/${listName}_Alerts_AdminAreasLevel.csv`;

    fs.writeFileSync(filePath, `${this.headers.join(',')}\n`);

    const selectedAlertText = dictionary.alertType_alertText[selectedAlert];

    const counts = this.featureDensityForAdminLevelAggregator.getCounts();
    Object.keys(counts.alerts).forEach((countryName) => {
      if (countryName === 'total') return;
      Object.keys(counts.alerts[countryName]).forEach((stateName) => {
        if (stateName === 'total') return;
        Object.keys(counts.alerts[countryName][stateName]).forEach((subStateName) => {
          if (subStateName === 'total') return;
          const subStateCount = counts.alerts[countryName][stateName][subStateName];

          const row = [
            listName,
            subStateName,
            stateName,
            countryName,
            selectedAlertText,
            selectedTimeframe,
            moment(startDate).format(DATE_FORMAT_CSV),
            moment(endDate).format(DATE_FORMAT_CSV),
            subStateCount,
            counts.alerts[countryName][stateName].total,
            counts.alerts[countryName].total,
          ];
          fs.appendFileSync(filePath, `${row.join(',')}\n`);
        });
      });
    });
  }
}
