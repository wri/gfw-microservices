import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { DashboardListLevelService } from '../pipe/dashboard.list.level.service';

@Injectable()
export class SouthEastAsiaOverlapService extends DashboardHandleDownload {
  private existSouthEastLocation = false;

  @Inject(DashboardListLevelService)
  private readonly dashboardListLevelService: DashboardListLevelService;

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'seAsiaOverlap' || type == 'everything')
    ) {
      super.start(filters, 'seAsiaOverlap', 'south_east_asia_overlap');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'seAsiaOverlap' || type == 'everything')
    ) {
      const locations = data.filter(
        (location) => location.southeast_asia_presence === 'true'
      );
      if (locations && locations.length > 0) {
        this.existSouthEastLocation = true;
        super.process(locations, filters);
      }
    }
  }

  finish(filters: GenerationFileRequest) {
    const { listView, selectedLocationsList, type } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
      this.existSouthEastLocation
    ) {
      this.dashboardListLevelService.generateCSV(
        filters,
        'seAsiaOverlapAggregate',
        'south_east_asia_overlap_aggregate'
      );
    }

    if (
      listView === 'forest_change' &&
      (type == 'seAsiaOverlap' || type == 'everything')
    ) {
      super.finish(filters);
    }
    this.existSouthEastLocation = false;
  }
}
