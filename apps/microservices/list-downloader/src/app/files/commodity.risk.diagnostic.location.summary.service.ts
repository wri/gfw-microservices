import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';

@Injectable()
export class CommodityRiskDiagnosticLocationSummaryService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (this.isCommodityRiskDiagnosticLocationSummaryFile(filters)) {
      super.start(
        filters,
        'commodityRiskDiagnosticLocationSummary',
        'commodity_risk_diagnostic_location_summary'
      );
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isCommodityRiskDiagnosticLocationSummaryFile(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: ListFieldsFileRequest) {
    if (this.isCommodityRiskDiagnosticLocationSummaryFile(filters)) {
      this.logger.log('Commodity Risk Diagnostic Location Summary Finish');
      await super.finish(filters);
    }
  }

  isCommodityRiskDiagnosticLocationSummaryFile(filters: ListFieldsFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'commodity_risk' &&
      (type === 'commodityRiskDiagnosticLocationSummary' || type === 'everything')
    );
  }
}
