import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class MillPriorityService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    const { type, listView } = filters;
    if (
      listView === 'commodity_risk' &&
      ( type == 'millPriority' || type == 'everything')
    ) {
      super.start(filters, 'millPriority', 'mill_priority_history');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { type, listView } = filters;
    if (
      listView === 'commodity_risk' &&
      (type == 'millPriority' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('Mill Priority Finish');
  }
}
