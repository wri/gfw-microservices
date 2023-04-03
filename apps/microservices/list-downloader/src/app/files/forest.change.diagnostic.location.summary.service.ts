import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class ForestChangeDiagnosticLocationSummaryService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'forestChangeDiagnosticLocationSummary' || type == 'everything')
    ) {
      super.start(
        filters,
        'forestChangeDiagnosticLocationSummary',
        'forest_change_diagnostic_location_summary'
      );
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'forestChangeDiagnosticLocationSummary' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('Forest Change Diagnostic Location Summary Finish');
  }
}
