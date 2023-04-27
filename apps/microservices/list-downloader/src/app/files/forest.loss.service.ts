import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import {
  cloneRow,
  formatPct,
  validatePct,
  parseListData,
} from '../shared/functions';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class ForestLossService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isForestLossFile(filters)) {
      super.start(filters, 'forestLoss', 'sensitive_areas_loss_forests');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isForestLossFile(filters)) {
      super.process(data, filters);
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    const csvData = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

    EXCEL_TEMPLATES[table].forEach((key) => {
      key.composites.forEach((field) => {
        const totalStatValue = parseListData(field.attribute, [
          listLevelAnalysis,
        ]);
        const dataRow = [list_name];

        let rowValue = 0;
        if (!listLevelAnalysis[field.attribute]) {
          return;
        }
        const yearlyData = JSON.parse(listLevelAnalysis[field.attribute]);

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
              const percent = formatPct(
                validatePct((rowValue[biomeYear] / totalBiomeValue) * 100)
              );
              currentRow.push(percent);
              csvData.push(currentBrazilianRow);
            });
          } else {
            currentRow.push(rowValue);
            currentRow.push(year);
            currentRow.push(totalStatValue);

            const percent = formatPct(
              validatePct((rowValue / totalStatValue) * 100)
            );
            currentRow.push(percent);

            if (totalStatValue > 0) {
              csvData.push(currentRow);
            }
          }
        });
      });
    });
    return csvData;
  }

  async finish(filters: GenerationFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isForestLossFile(filters)) {
      this.logger.log('Forest Loss Finish');
      if (selectedLocationsList.length != 1) {
        generateCSV(
          filters,
          'forestLossAggregate',
          'sensitive_areas_loss_of_forests_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
  }

  isForestLossFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'forest_change' &&
      (type === 'forestLoss' || type === 'everything')
    );
  }
}
