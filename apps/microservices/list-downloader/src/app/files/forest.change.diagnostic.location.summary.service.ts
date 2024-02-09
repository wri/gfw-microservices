import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class ForestChangeDiagnosticLocationSummaryService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (this.isForestChangeDiagnosticLocationSummaryFile(filters)) {
      super.start(
        filters,
        'forestChangeDiagnosticLocationSummary',
        'forest_change_diagnostic_location_summary'
      );
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isForestChangeDiagnosticLocationSummaryFile(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: ListFieldsFileRequest) {
    if (this.isForestChangeDiagnosticLocationSummaryFile(filters)) {
      this.logger.log('Forest Change Diagnostic Location Summary Finish');
      await super.finish(filters);
    }
  }

  isForestChangeDiagnosticLocationSummaryFile(filters: ListFieldsFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'forest_change' &&
      (type === 'forestChangeDiagnosticLocationSummary' || type === 'everything')
    );
  }
}
