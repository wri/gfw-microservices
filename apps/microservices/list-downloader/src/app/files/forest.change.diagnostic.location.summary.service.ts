import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class ForestChangeDiagnosticLocationSummaryService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    const { listView, type, selectedLocationsList } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
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
    const { listView, type, selectedLocationsList } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
      (type == 'forestChangeDiagnosticLocationSummary' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    const { listView, type, selectedLocationsList } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
      (type == 'forestChangeDiagnosticLocationSummary' || type == 'everything')
    ) {
      super.finish(filters);
    }
  }
}
