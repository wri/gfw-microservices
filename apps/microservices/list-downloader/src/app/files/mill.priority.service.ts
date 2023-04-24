import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class MillPriorityService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isMillPriorityFile(filters)) {
      super.start(filters, 'millPriority', 'mill_priority_history');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isMillPriorityFile(filters)) {
      super.process(data, filters);
    }
  }

  finish() {
    this.logger.log('Mill Priority Finish');
  }

  isMillPriorityFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'commodity_risk' &&
      (type === 'palmRiskAnalysis' ||
        type === 'millPriority' ||
        type === 'everything')
    );
  }
}
