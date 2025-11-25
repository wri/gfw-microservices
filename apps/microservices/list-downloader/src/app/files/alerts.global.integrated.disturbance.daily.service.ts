import { Injectable, Logger, Scope } from '@nestjs/common';
import {
  AlertFieldsFileRequest,
  AnalysesDashboardEntity,
  ClientStoreConnection,
  DashboardDataType,
} from '@wri-monorepos/sql';
import { PassThrough } from 'stream';
import * as fs from 'fs';
import { finished } from 'stream/promises';

import { IPipeService } from '../pipe/i.pipe.service';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';
import { FilterTimeframeIntegratedAlerts } from '../transform/filter.timeframe.integrated.alerts';
import { GlobalIntegratedDisturbanceAlertsDaily } from '../transform/global.integrated.disturbance.alerts.daily';
import { FormatNumber } from '../transform/format.number';
import { ConvertObject2CSV } from '../transform/convert.object.2.csv';
import { GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_DAILY_CSV_HEADER } from '../shared/constants';

@Injectable({
  scope: Scope.REQUEST,
})
export class AlertsGlobalIntegratedDisturbanceDailyService extends IPipeService {
  private readonly logger = new Logger(AlertsGlobalIntegratedDisturbanceDailyService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;
  private readonly suffix = 'Global_Integrated_Disturbance_Alerts_Daily';
  private readonly uniqueLocationIds = new Set<number>();

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {
    super();
  }

  start(filters: AlertFieldsFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(
      `(${listId}) - Starting stream to process Global Integrated Disturbance alerts data`
    );
    this.inputStream = new PassThrough({ objectMode: true });
    this.uniqueLocationIds.clear();

    this.organizeStream(filters);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${this.suffix}.csv`,
      `${Object.values(GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_DAILY_CSV_HEADER).join(',')}\n`
    );
  }

  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, startDate, endDate, key, listName } = filters;

    const inputColumns: string[] = [
      'integratedAlertsAreaAllNominal',
      'integratedAlertsAreaAllHigh',
      'integratedAlertsAreaAllHighest',
      'integratedAlertsAreaSbtnNaturalForestsNominal',
      'integratedAlertsAreaSbtnNaturalForestsHigh',
      'integratedAlertsAreaSbtnNaturalForestsHighest',
      'integratedAlertsAreaSbtnNaturalEcosystemNominal',
      'integratedAlertsAreaSbtnNaturalEcosystemHigh',
      'integratedAlertsAreaSbtnNaturalEcosystemHighest',
      'integratedAlertsAreaJrcNominal',
      'integratedAlertsAreaJrcHigh',
      'integratedAlertsAreaJrcHighest',
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
      .pipe(new GlobalIntegratedDisturbanceAlertsDaily(listName, startDate, endDate))
      .pipe(new FormatNumber())
      .pipe(
        new ConvertObject2CSV(Object.keys(GLOBAL_INTEGRATED_DISTURBANCE_ALERTS_DAILY_CSV_HEADER))
      )
      .pipe(this.fileStream);
  }

  process(analysisData: DashboardDataType[]) {
    analysisData?.forEach((data) => {
      if (data?.location_id && data.location_id !== -1) {
        this.uniqueLocationIds.add(data.location_id);
      }
      this.inputStream.write(data);
    });
  }

  async finish(filters: AlertFieldsFileRequest) {
    const { listId } = filters;

    this.logger.log(
      `(${listId}) - Finished processing Global Integrated Disturbance alerts data for CSV generation`
    );
    await this.writeAllData(this.inputStream);
    await finished(this.fileStream);
    this.fileStream.removeAllListeners();
    this.fileStream.destroy();
    await this.writeTotalLocationLine(filters);
  }

  private async writeTotalLocationLine(filters: AlertFieldsFileRequest) {
    const { listName, startDate, endDate, key } = filters;

    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
    const uniqueLocationsCount = this.uniqueLocationIds.size;
    const locationsSizeHa = await this.getListLocationsSize(filters);

    const finalRow = [
      `${listName}_${this.suffix}`,
      'Total locations',
      locationsSizeHa,
      '',
      '',
      '',
      'Global Integrated Disturbance Alert',
      formattedStartDate,
      formattedEndDate,
      '',
      '',
      '',
      '',
      '',
      '',
      uniqueLocationsCount,
    ];

    fs.appendFileSync(`/tmp/wri-${key}/${listName}_${this.suffix}.csv`, `${finalRow.join(',')}\n`);
  }

  private async getListLocationsSize(filters: AlertFieldsFileRequest): Promise<number> {
    const { organizationDatabase, listId } = filters;

    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const analysesDashboardRepo = connection.getRepository(AnalysesDashboardEntity);

      const { totalHaSum } = await analysesDashboardRepo
        .createQueryBuilder('analysis')
        .select('SUM(analysis.totalHa)', 'totalHaSum')
        .where('analysis.listId = :listId', { listId })
        .andWhere('analysis.locationId = -1')
        .getRawOne();

      return totalHaSum || 0;
    } catch (error) {
      this.logger.error('Error fetching location size information', error);
      return 0;
    }
  }
}
