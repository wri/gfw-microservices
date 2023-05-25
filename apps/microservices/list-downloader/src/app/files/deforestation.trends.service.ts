import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class DeforestationTrendsService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isDeforestationTrendsFile(filters)) {
      super.start(filters, 'deforestationTrends', 'trends_in_deforestation');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isDeforestationTrendsFile(filters)) {
      super.process(data, filters);
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    const csvData = [];
    csvData.push(['List Name', 'Loss (thousand ha)', 'Year']);

    const { commodity_threat_deforestation } = listLevelAnalysis ?? {};

    const deforestation = JSON.parse(commodity_threat_deforestation ?? '{}');
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

  async finish(filters: GenerationFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isDeforestationTrendsFile(filters)) {
      this.logger.log('Deforestation Trends Service finish');
      if (selectedLocationsList.length != 1) {
        generateCSV(
          filters,
          'deforestationTrendsAggregate',
          'trends_in_deforestation_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
  }

  isDeforestationTrendsFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'commodity_risk' &&
      (type === 'deforestationTrends' || type === 'everything')
    );
  }
}
