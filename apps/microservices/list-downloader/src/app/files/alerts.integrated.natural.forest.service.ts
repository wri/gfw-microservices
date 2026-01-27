import { Injectable, Logger, Scope } from '@nestjs/common';
import { IPipeService } from '../pipe/i.pipe.service';
import {
  AlertFieldsFileRequest,
  AnalysesDashboardEntity,
  ClientStoreConnection,
  DashboardDataType,
  Lists,
} from '@wri-monorepos/sql';
import { PassThrough } from 'stream';
import * as fs from 'fs';
import { ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER } from '../shared/constants';
import { finished } from 'stream/promises';
import { AlertsGetLocationOrListData } from '../transform/alerts.get.location.or.list.data';
import { IntegratedAlertsNaturalForest } from '../transform/integrated.alerts.natural.forest';
import { FilterTimeframeIntegratedAlerts } from '../transform/filter.timeframe.integrated.alerts';
import { FormatNumber } from '../transform/format.number';
import { ConvertObject2CSV } from '../transform/convert.object.2.csv';

@Injectable({
  scope: Scope.REQUEST,
})
export class AlertsIntegratedNaturalForestService extends IPipeService {
  private readonly logger = new Logger(AlertsIntegratedNaturalForestService.name);
  private inputStream: PassThrough;
  private fileStream: fs.WriteStream;
  private suffix = 'IntegratedAlerts_NaturalForest_Daily';

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {
    super();
  }

  start(filters: AlertFieldsFileRequest) {
    const { listId, key, listName } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    this.organizeStream(filters);
    fs.writeFileSync(
      `/tmp/wri-${key}/${listName}_${this.suffix}.csv`,
      `${Object.values(ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER).join(',')}\n`
    );
  }

  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, startDate, endDate, key, listName } = filters;

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
      .pipe(new IntegratedAlertsNaturalForest(listName, startDate, endDate))
      .pipe(new FormatNumber())
      .pipe(new ConvertObject2CSV(Object.keys(ALERTS_INTEGRATED_NATURAL_FOREST_SERVICE_CSV_HEADER)))
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
    await this.writeTotalLocationLine(filters);
  }

  async writeTotalLocationLine(filters: AlertFieldsFileRequest) {
    const { listName, startDate, endDate, key } = filters;

    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
    const locationsCount = await this.getListLocationsCount(filters);
    const locationsSizeHa = await this.getListLocationsSize(filters);

    fs.appendFileSync(
      `/tmp/wri-${key}/${listName}_${this.suffix}.csv`,
      `${listName},Total locations,Deforestation (Integrated Alerts),${formattedStartDate},${formattedEndDate},,${locationsSizeHa},,,,,${locationsCount}\n`
    );
  }

  private async getListLocationsCount(filters: AlertFieldsFileRequest) {
    const { organizationDatabase, listId } = filters;
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    const { listLocationsCount } = await listRepository.findOne({ where: { id: listId } });
    return listLocationsCount;
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
      console.error('Error fetching analysis data:', error);
      return 0;
    }
  }
}
