import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from './dashboard.handle.download';

@Injectable()
export class HistoricPercentService extends DashboardHandleDownload {

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'historicPercent' || type == 'everything')){
      super.start(filters, 'historicPercent', 'sensitive_areas_percentage_historic_area_lost');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'historicPercent' || type == 'everything')){
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    super.finish(filters);
  }
}
