import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class MillPriorityService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (this.isMillPriorityFile(filters)) {
      super.start(filters, 'millPriority', 'mill_priority_history');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isMillPriorityFile(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: ListFieldsFileRequest) {
    if (this.isMillPriorityFile(filters)) {
      this.logger.log('Mill Priority Finish');
      await super.finish(filters);
    }
  }

  isMillPriorityFile(filters: ListFieldsFileRequest) {
    const { listView, type, selectedLocationsList } = filters;
    return (
      listView === 'commodity_risk' &&
      ((selectedLocationsList.length === 1 && (type === 'millPriority' || type === 'everything')) ||
        (selectedLocationsList.length !== 1 &&
          (type === 'palmRiskAnalysis' || type === 'millPriority' || type === 'everything')))
    );
  }
}
