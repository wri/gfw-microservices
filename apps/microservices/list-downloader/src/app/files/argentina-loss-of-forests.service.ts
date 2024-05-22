import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

import { generateRows } from '../parser/argentina-loss-of-forests-parser';

@Injectable()
export class ArgentinaLossOfForestsService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (this.isForestLossFile(filters)) {
      super.start(filters, 'argentinaLossOfForests', 'argentina_loss_of_forests');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isForestLossFile(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: ListFieldsFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isForestLossFile(filters)) {
      this.logger.log('Forest Loss Finish');
      if (selectedLocationsList.length != 1) {
        generateCSV(
          filters,
          'argentinaLossOfForests',
          'argentina_loss_of_forests',
          generateRows,
          false
        );
      }
      await super.finish(filters);
    }
  }

  isForestLossFile(filters: ListFieldsFileRequest) {
    const { listView, type } = filters;
    return listView === 'forest_change' && (type === 'southAmericaTCL' || type === 'everything');
  }
}
