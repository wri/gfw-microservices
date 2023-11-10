import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
// import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class ArgentinaOverlap extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isArgentinaOverlapFile(filters)) {
      super.start(filters, 'argentinaOverlap', 'argentina_overlap');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isArgentinaOverlapFile(filters)) {
      super.process(data, filters);
    }
  }

  /*generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    const csvData = [];

    return csvData;
  }*/

  async finish(filters: GenerationFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isArgentinaOverlapFile(filters)) {
      this.logger.log('Argentina Overlap Service finish');
      if (selectedLocationsList.length != 1) {
        /*generateCSV(
          filters,
          'argentinaOtbnOverlapAggregate',
          'argetina_otbn_overlap_aggregate',
          this.generateAggregate
        );*/
      }
      await super.finish(filters);
    }
  }

  isArgentinaOverlapFile(filters: GenerationFileRequest) {
    const { type } = filters;
    return type === 'argentinaOverlap' || type === 'everything';
  }
}
