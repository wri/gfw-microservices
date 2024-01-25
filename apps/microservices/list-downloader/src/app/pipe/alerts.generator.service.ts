import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest } from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';
import { AlertsDataService } from '../data/alerts.data.service';
import { AlertsFileService } from '../files/alerts.file.service';
import * as asyncPool from 'tiny-async-pool';

@Injectable()
export class AlertsGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AlertsGeneratorService.name);
  constructor(
    private readonly alertDataService: AlertsDataService,
    private readonly alertsFileService: AlertsFileService,
  ) {
    super();
  }
  async makeFile(filters: AlertFieldsFileRequest): Promise<void> {

    const numberOfPages = await this.alertDataService.getNumberOfPages(filters);
    const { listId } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    await this.alertsFileService.start(filters);

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, pageNumber: i };
      const analysisData = await this.alertDataService.getDataPaginated(newFilter);
      this.alertsFileService.process(analysisData, newFilter);
      return i;
    };

    for await (const localPage of asyncPool(this.POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }

    await this.alertsFileService.finish(filters);
  }
}
