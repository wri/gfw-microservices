import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { DashboardListLevelService } from '../pipe/dashboard.list.level.service';

@Injectable()
export class ForestLossService extends DashboardHandleDownload {
  @Inject(DashboardListLevelService)
  private readonly dashboardListLevelService: DashboardListLevelService;

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'forestLoss' || type == 'everything')
    ) {
      super.start(filters, 'forestLoss', 'sensitive_areas_loss_forests');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'forestLoss' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    const { listView, selectedLocationsList, type } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
      (type == 'forestLoss' || type == 'everything')
    ) {
      this.dashboardListLevelService.generateCSV(
        filters,
        'forestLossAggregate',
        'sensitive_areas_loss_of_forests_aggregate'
      );
    }
    if (
      listView === 'forest_change' &&
      (type == 'forestLoss' || type == 'everything')
    ) {
      super.finish(filters);
    }
  }
}
