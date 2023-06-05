import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class ForestChangeDiagnosticLocationSummaryService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isForestChangeDiagnosticLocationSummaryFile(filters)) {
      super.start(
        filters,
        'forestChangeDiagnosticLocationSummary',
        'forest_change_diagnostic_location_summary'
      );
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isForestChangeDiagnosticLocationSummaryFile(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: GenerationFileRequest) {
    if (this.isForestChangeDiagnosticLocationSummaryFile(filters)) {
      this.logger.log('Forest Change Diagnostic Location Summary Finish');
      super.finish(filters);
    }
  }

  isForestChangeDiagnosticLocationSummaryFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'forest_change' &&
      (type === 'forestChangeDiagnosticLocationSummary' || type === 'everything')
    );
  }
}
