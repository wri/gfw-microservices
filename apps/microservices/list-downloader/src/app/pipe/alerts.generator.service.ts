import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, AlertsTimeframes } from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';
import { AlertsDataService } from '../data/alerts.data.service';
import * as asyncPool from 'tiny-async-pool';
import { subDays, endOfDay, format } from 'date-fns';
import { AlertsFileService } from '../files/alerts.file.service';
import { POOL_SIZE, DATE_FORMAT } from '../shared/constants';

@Injectable()
export class AlertsGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AlertsGeneratorService.name);

  constructor(
    private alertDataService: AlertsDataService,
    private readonly alertsFileService: AlertsFileService
  ) {
    super();
  }

  async makeFile(filters: AlertFieldsFileRequest): Promise<void> {
    const numberOfPages = await this.alertDataService.getNumberOfPages(filters);
    const { listId, startDate, endDate, selectedTimeframe } = filters;

    if (selectedTimeframe && selectedTimeframe !== AlertsTimeframes.DAY) {
      this.logger.warn(
        `(${listId}) - Only DAY timeframe is supported for alerts export. Received: ${selectedTimeframe}`
      );
    }

    if (!startDate || !endDate) {
      const dates = this.getDefaultDateRange();
      filters.startDate = dates.startDate;
      filters.endDate = dates.endDate;
    }

    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);
    await this.alertsFileService.start(filters);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, page: i + 1 };
      const analysisData = await this.alertDataService.getDataPaginated(newFilter);
      this.alertsFileService.process(analysisData);
      return i;
    };

    for await (const localPage of asyncPool(POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }
    await this.alertsFileService.finish(filters);
  }

  private getDefaultDateRange() {
    const startDateFormat = `${DATE_FORMAT} 00:00:00`;
    const endDateFormat = `${DATE_FORMAT} 23:59:59`;

    return {
      startDate: format(subDays(new Date(), 1), startDateFormat),
      endDate: format(endOfDay(new Date()), endDateFormat),
    };
  }
}
