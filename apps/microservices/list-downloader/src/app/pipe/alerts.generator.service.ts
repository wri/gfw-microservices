import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest } from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';
import { AlertsDataService } from '../data/alerts.data.service';
import * as asyncPool from 'tiny-async-pool';
import * as moment from 'moment';
import { AlertsFileService } from '../files/alerts.file.service';

const DATE_FORMAT = 'YYYY-MM-DD';

@Injectable()
export class AlertsGeneratorService extends IFileGenerator {
  private readonly logger = new Logger(AlertsGeneratorService.name);

  constructor(
    private readonly alertDataService: AlertsDataService,
    private readonly alertsFileService: AlertsFileService
  ) {
    super();
  }

  async makeFile(filters: AlertFieldsFileRequest): Promise<void> {
    const numberOfPages = await this.alertDataService.getNumberOfPages(filters);
    const { listId, startDate, endDate, selectedTimeframe } = filters;
    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);
    await this.alertsFileService.start(filters);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    if (!startDate || !endDate) {
      const { startDate, endDate } = this.getTimeframeBoundaries(selectedTimeframe);
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, page: i + 1 };
      const analysisData = await this.alertDataService.getDataPaginated(newFilter);
      this.alertsFileService.process(analysisData);
      return i;
    };

    for await (const localPage of asyncPool(this.POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }
    await this.alertsFileService.finish(filters);
  }

  getTimeframeBoundaries(selectedTimeframe: string) {
    switch (selectedTimeframe) {
      case 'DAY': {
        return {
          startDate: moment().subtract(1, 'days').format(DATE_FORMAT),
          endDate: moment().endOf('day').format(DATE_FORMAT),
        };
      }
      case 'WEEK': {
        return {
          startDate: moment().subtract(1, 'week').format(DATE_FORMAT),
          endDate: moment().subtract(1, 'day').format(DATE_FORMAT),
        };
      }
      case 'MONTH': {
        return {
          startDate: moment().subtract(1, 'month').startOf('month').format(DATE_FORMAT),
          endDate: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT),
        };
      }
      case 'QUARTER': {
        return {
          startDate: moment().subtract(3, 'month').startOf('month').format(DATE_FORMAT),
          endDate: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT),
        };
      }
      case 'YEAR': {
        return {
          startDate: moment().subtract(12, 'month').startOf('month').format(DATE_FORMAT),
          endDate: moment().subtract(1, 'month').endOf('month').format(DATE_FORMAT),
        };
      }
    }
  }
}
