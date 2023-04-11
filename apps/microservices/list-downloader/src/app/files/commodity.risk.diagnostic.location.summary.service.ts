import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class CommodityRiskDiagnosticLocationSummaryService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isCommodityRiskDiagnosticLocationSummaryFile(filters)) {
      super.start(
        filters,
        'commodityRiskDiagnosticLocationSummary',
        'commodity_risk_diagnostic_location_summary'
      );
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isCommodityRiskDiagnosticLocationSummaryFile(filters)) {
      super.process(data, filters);
    }
  }

  finish() {
    this.logger.log('Commodity Risk Diagnostic Location Summary Finish');
  }

  isCommodityRiskDiagnosticLocationSummaryFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'commodity_risk' &&
      (type == 'commodityRiskDiagnosticLocationSummary' || type == 'everything')
    );
  }
}
