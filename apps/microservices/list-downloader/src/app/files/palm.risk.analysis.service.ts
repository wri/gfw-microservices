import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class PalmRiskAnalysisService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isPalmRiskAnalysisFile(filters)) {
      super.start(filters, 'palmRiskAnalysis', 'palm_risk_analysis');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isPalmRiskAnalysisFile(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: GenerationFileRequest) {
    if (this.isPalmRiskAnalysisFile(filters)) {
      this.logger.log('Finish Palm Risk Analysis');
      await super.finish(filters);
    }
  }

  isPalmRiskAnalysisFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return listView === 'commodity_risk' && (type === 'palmRiskAnalysis' || type === 'everything');
  }
}
