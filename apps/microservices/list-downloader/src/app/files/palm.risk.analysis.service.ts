import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class PalmRiskAnalysisService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'commodity_risk' &&
      (type == 'palmRiskAnalysis' || type == 'everything')
    ) {
      super.start(filters, 'palmRiskAnalysis', 'palm_risk_analysis');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'commodity_risk' &&
      (type == 'palmRiskAnalysis' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('Finish Palm Risk Analysis');
  }
}
