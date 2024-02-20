import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';
import { IPipeService } from '../pipe/i.pipe.service';
import { EventEmitter, PassThrough, Transform } from 'stream';
import { dictionary } from '../shared/alert.utils';
import { ApplyTimeframeFilter } from '../transform/apply.timeframe.filter';
import * as fs from 'fs';

class GenerateAlertsSummary extends EventEmitter {
  private locationsWithinAlerts = 0;
  private locationsWithAlerts = 0;
  private totalLocations = 0;
  private totalAlerts = 0;

  constructor() {
    super();
    this.on('calculateAlertsSummary', this.calculateAlertsSummary);
    this.on('cleanAlertsSummary', this.cleanAlertsSummary);
  }

  cleanAlertsSummary() {
    this.locationsWithinAlerts = 0;
    this.locationsWithAlerts = 0;
    this.totalLocations = 0;
    this.totalAlerts = 0;
  }

  calculateAlertsSummary({ chunk, selectedProperty, selectedAlertsProperty, selectedAlert }) {
    const { location_id } = chunk;
    if (location_id !== -1) {
      this.locationsWithinAlerts += chunk[selectedAlertsProperty] ? 1 : 0;
      this.locationsWithAlerts += Object.keys(chunk[selectedProperty]).length > 0 ? 1 : 0;
      this.totalLocations++;
    } else {
      if (selectedAlert === 'GLAD') {
        this.totalAlerts += chunk[selectedProperty]
          .flat()
          .reduce((acc, curr) => curr.count + acc, 0);
      } else {
        this.totalAlerts += Object.values(chunk.fireTimeframe)
          .map(
            (
              arr: Array<{
                count: number;
              }>
            ) => arr.reduce((total, element) => total + element.count, 0)
          )
          .reduce((featureTotal, el) => featureTotal + el, 0);
      }
    }
  }

  getAlertsSummary() {
    return {
      totalLocationsWithAlertsData: this.locationsWithinAlerts,
      totalLocations: this.totalLocations,
      locationsWithAlerts: this.locationsWithAlerts,
      percentageWithAlerts: (this.locationsWithAlerts / this.locationsWithinAlerts) * 100,
      totalAlerts: this.totalAlerts,
    };
  }
}

class EventEmitterTransform extends Transform {
  constructor(private eventEmitter: EventEmitter, private filters: AlertFieldsFileRequest) {
    super({ objectMode: true });
  }

  _transform(chunk: DashboardDataType, _, next) {
    const { selectedAlert } = this.filters;
    const selectedProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
    const selectedAlertsProperty = dictionary.alertType_featureCoverageProperty[selectedAlert];
    this.eventEmitter.emit('calculateAlertsSummary', {
      chunk,
      selectedProperty,
      selectedAlertsProperty,
      selectedAlert,
    });
    next();
  }
}

@Injectable()
export class AlertsSummaryService extends IPipeService {
  private readonly logger = new Logger(AlertsSummaryService.name);
  private inputStream: PassThrough;
  private generateAlertsSummary: GenerateAlertsSummary;
  private headers = [
    'List(s)',
    'Alert Type',
    'Timeframe',
    'Total Locations with alerts data',
    'Total Locations',
    'Locations with Alerts',
    'Percentage Locations with Alerts of All Locations',
    'Number of Alerts',
  ];

  start(filters: AlertFieldsFileRequest) {
    const { listId } = filters;
    this.logger.log(`(${listId}) - Starting stream to process data`);
    this.inputStream = new PassThrough({ objectMode: true });

    this.generateAlertsSummary = new GenerateAlertsSummary();
    this.organizeStream(filters);
    this.generateAlertsSummary.emit('cleanAlertsSummary');
  }

  private organizeStream(filters: AlertFieldsFileRequest) {
    const { listId, startDate, endDate, selectedTimeframe, selectedAlert } = filters;
    this.inputStream.removeAllListeners();

    this.inputStream.on('error', async (err) => {
      this.logger.error(`(${listId}) - Error on stream: ${err}`);
      await this.errorEmail(filters);
    });

    this.inputStream
      .pipe(new ApplyTimeframeFilter(selectedTimeframe, selectedAlert, startDate, endDate))
      .pipe(new EventEmitterTransform(this.generateAlertsSummary, filters));
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
    const filePath = `/tmp/wri-${key}/${listName}_AlertsSummary.csv`;

    const selectedAlertText = dictionary.alertType_alertText[selectedAlert];
    fs.writeFileSync(filePath, `${this.headers.join(',')}\n`);

    const {
      totalLocationsWithAlertsData,
      totalLocations,
      locationsWithAlerts,
      percentageWithAlerts,
      totalAlerts,
    } = this.generateAlertsSummary.getAlertsSummary();

    const rows = [
      listName,
      selectedAlertText,
      selectedTimeframe,
      totalLocations,
      totalLocationsWithAlertsData,
      locationsWithAlerts,
      percentageWithAlerts,
      totalAlerts,
    ];

    fs.appendFileSync(filePath, `${rows.join(',')}\n`);
  }
}
