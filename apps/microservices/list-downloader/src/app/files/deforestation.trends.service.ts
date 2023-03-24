import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class DeforestationTrendsService extends DashboardHandleDownload {
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

  generateAggregate(table: string, list_name: string, listLevelAnalysis: any) {
    const csvData = [];
    csvData.push(['List Name', 'Loss (thousand ha)', 'Year']);
    const deforestation = JSON.parse(
      listLevelAnalysis.commodity_threat_deforestation
    );
    Object.keys(deforestation).forEach((year) => {
      const dataRow = [list_name];
      const value = deforestation[year];
      const rounded = value.toFixed(4);
      dataRow.push(rounded);
      dataRow.push(year);

      csvData.push(dataRow);
    });
    return csvData;
  }

  finish(filters: GenerationFileRequest) {
    const { listView, selectedLocationsList, type } = filters;
    if (
      listView === 'commodity_risk' &&
      selectedLocationsList.length != 1 &&
      (type == 'deforestationTrends' || type == 'everything')
    ) {
      generateCSV(
        filters,
        'deforestationTrendsAggregate',
        'trends_in_deforestation_aggregate',
        this.generateAggregate
      );
      super.finish(filters);
    }
  }
}
