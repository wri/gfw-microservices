import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { cloneRow } from '../shared/functions';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class SouthAmericaLossService extends DashboardHandleDownload {
  private existSouthLocation = false;

  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'SouthAmerica' || type == 'everything')
    ) {
      super.start(filters, 'sAmericaLoss', 'south_america_loss_of_forests');
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'SouthAmerica' || type == 'everything')
    ) {
      const locations = data.filter(
        (location) => location.south_america_presence === 'true'
      );
      if (locations && locations.length > 0) {
        this.existSouthLocation = true;
        super.process(locations, filters);
      }
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis: any) {
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
        if (field.label !== 'Brazil Biomes') {
          Object.keys(yearlyData).forEach((yr) => {
            totalSubCategory += yearlyData[yr];
          });
        }

        Object.keys(yearlyData).forEach((year) => {
          const currentRow = cloneRow(dataRow);
          rowValue = yearlyData[year];

          currentRow.push(field.label);

          if (field.label === 'Brazil Biomes') {
            let totalBiomeValue = 0;
            Object.keys(rowValue).forEach((biomeYearFirst) => {
              totalBiomeValue += rowValue[biomeYearFirst];
            });

            Object.keys(rowValue).forEach((biomeYear) => {
              const currentBrazilianRow = cloneRow(dataRow);
              currentBrazilianRow.push(`Brazil Biomes - ${year}`);
              currentBrazilianRow.push(rowValue[biomeYear]);
              currentBrazilianRow.push(biomeYear);
              currentBrazilianRow.push(totalBiomeValue.toFixed(2));
              csvData.push(currentBrazilianRow);
            });
          } else {
            if (totalSubCategory > 0) {
              const nestedRow = cloneRow(dataRow);
              nestedRow.push(field.label);
              nestedRow.push(rowValue);
              nestedRow.push(year);
              nestedRow.push(totalSubCategory.toFixed(2));
              csvData.push(nestedRow);
            }
          }
        });
      });
    });
    return csvData;
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('Finish South America Loss');
    const { listView, selectedLocationsList, type } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
      this.existSouthLocation
    ) {
      generateCSV(
        filters,
        'sAmericaLossAggregate',
        'south_america_loss_of_forests_aggregate',
        this.generateAggregate
      );
    }
    this.existSouthLocation = false;
  }
}
