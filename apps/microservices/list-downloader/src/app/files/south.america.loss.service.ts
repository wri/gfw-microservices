import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { DashboardListLevelService } from '../pipe/dashboard.list.level.service';

@Injectable()
export class SouthAmericaLossService extends DashboardHandleDownload {
  private existSouthLocation = false;

  @Inject(DashboardListLevelService)
  private readonly dashboardListLevelService: DashboardListLevelService;

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'sAmericaLoss' || type == 'everything')){
      super.start(filters, 'sAmericaLoss', 'south_america_loss_of_forests');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if(listView === 'forest_change' && ( type == 'sAmericaLoss' || type == 'everything')){
      const locations = data.filter((location) => location.south_america_presence === 'true');
      if(locations && locations.length > 0){
        this.existSouthLocation = true;
        super.process(locations, filters);
      }
    }
  }

  finish(filters: GenerationFileRequest) {
    const { listView, selectedLocationsList, type } = filters;
    if (listView === 'forest_change' && selectedLocationsList.length != 1 && this.existSouthLocation) {
      this.dashboardListLevelService.generateCSV(filters, 'sAmericaLossAggregate','south_america_loss_of_forests_aggregate');
    }

    if(listView === 'forest_change' && ( type == 'sAmericaLoss' || type == 'everything')){
      super.finish(filters);
    }
    this.existSouthLocation = false;
  }
}
