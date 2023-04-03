import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class CommodityRiskDiagnosticLocationSummaryService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'commodity_risk' &&
      (type == 'commodityRiskDiagnosticLocationSummary' || type == 'everything')
    ) {
      super.start(
        filters,
        'commodityRiskDiagnosticLocationSummary',
        'commodity_risk_diagnostic_location_summary'
      );
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'commodity_risk' &&
      (type == 'commodityRiskDiagnosticLocationSummary' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('Commodity Risk Diagnostic Location Summary Finish');
  }
}
