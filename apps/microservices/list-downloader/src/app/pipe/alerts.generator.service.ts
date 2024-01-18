import { Injectable, Logger } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';
import { AnalysisAlertsDataService } from '../data/analysis.alerts.data.service';
import { AlertsFileService } from '../files/alerts.file.service';
import * as asyncPool from 'tiny-async-pool';
@Injectable()
export class AlertsGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AlertsGeneratorService.name);

  constructor(
    private readonly alertsFileService: AlertsFileService,
    private readonly analysisDashboardDataService: AnalysisAlertsDataService
  ) {
    super();
  }

  async makeFile(filters: GenerationFileRequest): Promise<void> {
    const numberOfPages = await this.analysisDashboardDataService.getNumberOfPages(filters);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    await this.alertsFileService.start(filters, 'deforestation_kpis');

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, page: i + 1 };
      const analysisData = await this.analysisDashboardDataService.getDataPaginated(newFilter);
      this.alertsFileService.process(analysisData, filters);
      return i;
    };

    for await (const localPage of asyncPool(this.POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await this.alertsFileService.finish(filters);
  }
}
