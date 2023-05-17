import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { cloneRow } from '../shared/functions';
import { DATA_LAYER, EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';
import SouthAmericaLossAggregateHandler from '../strategies/south-america-loss/aggregate';

@Injectable()
export class SouthAmericaLossService extends DashboardHandleDownload {
  private existSouthLocation = false;

  start(filters: GenerationFileRequest) {
    if (this.isSouthAmericaLossFile(filters)) {
      super.start(filters, 'sAmericaLoss', 'south_america_loss_of_forests');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isSouthAmericaLossFile(filters)) {
      const locations = data.filter(
        (location) => location.south_america_presence === 'true'
      );
      if (locations && locations.length > 0) {
        this.existSouthLocation = true;
        super.process(locations, filters);
      }
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    const csvData = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

    EXCEL_TEMPLATES[table].forEach((key) => {
      key.composites.forEach((field) => {
        const dataRow = [list_name];

        let rowValue = 0;
        if (!listLevelAnalysis[field.attribute]) {
          return;
        }
        const yearlyData = JSON.parse(listLevelAnalysis[field.attribute]);
        let totalSubCategory = 0;
        if (!Object.values(DATA_LAYER).some(dataLayer => field.label == dataLayer)) {
          Object.keys(yearlyData).forEach((yr) => {
            totalSubCategory += yearlyData[yr];
          });
        }

        const handler = new SouthAmericaLossAggregateHandler(field.label);

        Object.keys(yearlyData).forEach((year) => {
          const currentRow = cloneRow(dataRow);
          rowValue = yearlyData[year]; 

          currentRow.push(field.label);
          handler.processLabel(field, rowValue, year, dataRow, csvData, totalSubCategory);
        });
      });
    });
    return csvData;
  }

  async finish(filters: GenerationFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isSouthAmericaLossFile(filters)) {
      this.logger.log('Finish South America Loss');
      if (selectedLocationsList.length != 1 && this.existSouthLocation) {
        generateCSV(
          filters,
          'sAmericaLossAggregate',
          'south_america_loss_of_forests_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
    this.existSouthLocation = false;
  }

  isSouthAmericaLossFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'forest_change' &&
      (type === 'southAmericaTCL' || type === 'everything')
    );
  }
}
