import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { DashboardListLevelService } from '../pipe/dashboard.list.level.service';

@Injectable()
export class DeforestationTrendsService extends DashboardHandleDownload {
  @Inject(DashboardListLevelService)
  private readonly dashboardListLevelService: DashboardListLevelService;

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'commodity_risk' &&
      (type == 'deforestationTrends' || type == 'everything')
    ) {
      super.start(filters, 'deforestationTrends', 'trends_in_deforestation');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'commodity_risk' &&
      (type == 'deforestationTrends' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    const { listView, selectedLocationsList, type } = filters;
    if (listView === 'commodity_risk' &&
    selectedLocationsList.length != 1 &&
    (type == 'deforestationTrends' || type == 'everything')){
      this.dashboardListLevelService.generateCSV(
        filters,
        'deforestationTrendsAggregate',
        'trends_in_deforestation_aggregate'
      );
      super.finish(filters);
    }
  }
}
