import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from './dashboard.handle.download';

@Injectable()
export class ForestChangeSummaryService extends DashboardHandleDownload {

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'forestChangeDiagnosticLocationSummary' || type == 'everything')){
      super.start(filters, 'forestChangeDiagnosticLocationSummary', 'forest_change_diagnostic_location_summary');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'forestChangeDiagnosticLocationSummary' || type == 'everything')){
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    super.finish(filters);
  }
}
