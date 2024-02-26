import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest } from '@wri-monorepos/sql';
import { IFileGenerator } from './i.file.generator';
import { AlertsDataService } from '../data/alerts.data.service';
import * as asyncPool from 'tiny-async-pool';
import * as moment from 'moment';
import { AlertsFileService } from '../files/alerts.file.service';
import {
  POOL_SIZE,
  SELECTED_TIMEFRAME_MONTH,
  SELECTED_TIMEFRAME_QUARTER,
  SELECTED_TIMEFRAME_WEEK,
  SELECTED_TIMEFRAME_YEAR,
  SELECTED_TIMEFRAME_DAY,
  DATE_FORMAT,
} from '../shared/constants';

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
    if (!startDate || !endDate) {
      const { startDate, endDate } = this.getTimeframeBoundaries(selectedTimeframe);
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    this.logger.log(`(${listId}) - Number of pages: ${numberOfPages}`);
    await this.alertsFileService.start(filters);

    const arrayOfPages = Array.from(Array(numberOfPages).keys());

    const composeResults = async (i: number) => {
      const newFilter = { ...filters, page: i + 1 };
      const analysisData = await this.alertDataService.getDataPaginated(newFilter);
      this.alertsFileService.process(analysisData, newFilter);
      return i;
    };

    for await (const localPage of asyncPool(POOL_SIZE, arrayOfPages, composeResults)) {
      this.logger.log(`(${listId}) - Get page of number ${localPage} from database`);
    }
    await this.alertsFileService.finish(filters);
  }

  getTimeframeBoundaries(selectedTimeframe: string) {
    const startDateFormat = `${DATE_FORMAT} 00:00:00`;
    const endDateFormat = `${DATE_FORMAT} 23:59:59`;

    switch (selectedTimeframe) {
      case SELECTED_TIMEFRAME_DAY: {
        return {
          startDate: moment().subtract(1, 'days').format(startDateFormat),
          endDate: moment().endOf('day').format(endDateFormat),
        };
      }
      case SELECTED_TIMEFRAME_WEEK: {
        return {
          startDate: moment().subtract(1, 'week').startOf('week').format(startDateFormat),
          endDate: moment().subtract(1, 'week').endOf('week').format(endDateFormat),
        };
      }
      case SELECTED_TIMEFRAME_MONTH: {
        return {
          startDate: moment().subtract(1, 'month').startOf('month').format(startDateFormat),
          endDate: moment().subtract(1, 'month').endOf('month').format(endDateFormat),
        };
      }
      case SELECTED_TIMEFRAME_QUARTER: {
        return {
          startDate: moment().subtract(3, 'month').startOf('month').format(startDateFormat),
          endDate: moment().subtract(1, 'month').endOf('month').format(endDateFormat),
        };
      }
      case SELECTED_TIMEFRAME_YEAR: {
        return {
          startDate: moment().subtract(12, 'month').startOf('month').format(startDateFormat),
          endDate: moment().subtract(1, 'month').endOf('month').format(endDateFormat),
        };
      }
    }
  }
}
