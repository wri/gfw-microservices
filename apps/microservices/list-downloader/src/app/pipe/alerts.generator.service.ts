import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest } from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';
import { AlertsDataService } from '../data/alerts.data.service';
import * as asyncPool from 'tiny-async-pool';
import { AlertsAdminAreasLevelService } from '../files/alerts.admin.areas.level.service';
import { AlertsHistoryService } from '../files/alerts.history.service';
import { AlertsLocationsLevelService } from '../files/alerts.locations.level.service';
import { AlertsPrioritiesAdminAreasLevelService } from '../files/alerts.priorities.admin.areas.level.service';
import { AlertsSummaryService } from '../files/alerts.summary.service';
import { AlertsPrioritiesLocationsLevelService } from '../files/alerts.priorities.locations.level.service';

@Injectable()
export class AlertsGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AlertsGeneratorService.name);
  constructor(
    private readonly alertDataService: AlertsDataService,
    private readonly alertsAdminAreasLevelService:AlertsAdminAreasLevelService,
    private readonly alertsHistoryService:AlertsHistoryService,
    private readonly alertsLocationsLevelService:AlertsLocationsLevelService,
    private readonly alertsPrioritiesAdminAreasLevelService:AlertsPrioritiesAdminAreasLevelService,
    private readonly alertsPrioritiesLocationsLevelService:AlertsPrioritiesLocationsLevelService,
    private readonly alertsSummaryService:AlertsSummaryService,
  ) {
    super();
  }
  async makeFile(filters: AlertFieldsFileRequest): Promise<void> {

    const numberOfPages = await this.alertDataService.getNumberOfPages(filters);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    await this.alertsAdminAreasLevelService.start(filters);
    // await this.alertsHistoryService.start(filters);
    // await this.alertsLocationsLevelService.start(filters);
    // await this.alertsPrioritiesAdminAreasLevelService.start(filters);
    // await this.alertsPrioritiesLocationsLevelService.start(filters);
    // await this.alertsSummaryService.start(filters);

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, pageNumber: i };
      const analysisData = await this.alertDataService.getDataPaginated(newFilter);
      await this.alertsAdminAreasLevelService.process(analysisData, newFilter);
      // await this.alertsHistoryService.process(analysisData, newFilter);
      // await this.alertsLocationsLevelService.process(analysisData, newFilter);
      // await this.alertsPrioritiesAdminAreasLevelService.process(analysisData, newFilter);
      // await this.alertsPrioritiesLocationsLevelService.process(analysisData, newFilter);
      // await this.alertsSummaryService.process(analysisData, newFilter);
      return i;
    };

    for await (const localPage of asyncPool(this.POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await this.alertsAdminAreasLevelService.finish(filters);
    // await this.alertsHistoryService.finish(filters);
    // await this.alertsLocationsLevelService.finish(filters);
    // await this.alertsPrioritiesAdminAreasLevelService.finish(filters);
    // await this.alertsPrioritiesLocationsLevelService.finish(filters);
    // await this.alertsSummaryService.finish(filters);
  }
}
