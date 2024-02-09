import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class PalmRiskAnalysisService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (this.isPalmRiskAnalysisFile(filters)) {
      super.start(filters, 'palmRiskAnalysis', 'palm_risk_analysis');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isPalmRiskAnalysisFile(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: ListFieldsFileRequest) {
    if (this.isPalmRiskAnalysisFile(filters)) {
      this.logger.log('Finish Palm Risk Analysis');
      await super.finish(filters);
    }
  }

  isPalmRiskAnalysisFile(filters: ListFieldsFileRequest) {
    const { listView, type } = filters;
    return listView === 'commodity_risk' && (type === 'palmRiskAnalysis' || type === 'everything');
  }
}
