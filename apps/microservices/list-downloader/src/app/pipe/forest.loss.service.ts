import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from './dashboard.handle.download';

@Injectable()
export class ForestLossService extends DashboardHandleDownload {

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'forestLoss' || type == 'everything')){
      super.start(filters, 'forestLoss', 'sensitive_areas_loss_forests');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'forestLoss' || type == 'everything')){
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    super.finish(filters);
  }
}
