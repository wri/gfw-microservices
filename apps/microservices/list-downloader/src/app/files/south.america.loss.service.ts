import { Injectable, Scope } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { cloneRow } from '../shared/functions';
import { DATA_LAYER, EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';
import SouthAmericaLossAggregateHandler from '../strategies/south-america-loss/aggregate';

@Injectable({
  scope: Scope.REQUEST,
})
export class SouthAmericaLossService extends DashboardHandleDownload {
  private existSouthLocation = false;

  start(filters: ListFieldsFileRequest) {
    if (this.isSouthAmericaLossFile(filters)) {
      super.start(filters, 'sAmericaLoss', 'south_america_loss_of_forests');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isSouthAmericaLossFile(filters)) {
      const locations = data.filter((location) => location.south_america_presence === 'true');
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
      const { composites } = key;
      composites.forEach((field) => {
        const dataRow = [list_name];
        const { attribute, label } = field;

        if (!listLevelAnalysis?.[attribute]) {
          return;
        }

        let rowValue = 0;
        let yearlyData;

        // Prefer BRA-specific WDPA from country_specific_deforestation_wdpa_yearly when available;
        // fallback to tree_cover_loss_prodes_wdpa_yearly for backward compatibility.
        if (attribute === 'tree_cover_loss_prodes_wdpa_yearly' && !yearlyData) {
          const braWdpaRaw = JSON.parse(
            listLevelAnalysis.country_specific_deforestation_wdpa_yearly || '{}'
          )?.BRA;

          if (braWdpaRaw && typeof braWdpaRaw === 'object') {
            // Check if braWdpaRaw has nested categories (objects) or is flat yearly data (numbers)
            const firstValue = Object.values(braWdpaRaw)[0];
            const hasNestedCategories = firstValue && typeof firstValue === 'object' && !Array.isArray(firstValue);

            if (hasNestedCategories) {
              // Aggregate all categories (Category I, II, III, IV, V, VI, etc.)
              yearlyData = {};
              Object.values(braWdpaRaw).forEach((cat) => {
                if (cat && typeof cat === 'object' && !Array.isArray(cat)) {
                  Object.entries(cat).forEach(([year, val]) => {
                    yearlyData[year] = (yearlyData[year] || 0) + (val || 0);
                  });
                }
              });
            } else {
              // Flat yearly data structure, use as-is
              yearlyData = braWdpaRaw;
            }
          }
        }

        if (!yearlyData) {
          yearlyData = JSON.parse(listLevelAnalysis[attribute] || '{}');
        }

        let totalSubCategory = 0;
        if (!Object.values(DATA_LAYER).some((dataLayer) => label == dataLayer)) {
          Object.keys(yearlyData).forEach((yr) => {
            totalSubCategory += yearlyData[yr];
          });
        }

        const handler = new SouthAmericaLossAggregateHandler(label);

        Object.keys(yearlyData).forEach((year) => {
          const currentRow = cloneRow(dataRow);
          rowValue = yearlyData[year];

          currentRow.push(label);
          handler.processLabel(field, rowValue, year, dataRow, csvData, totalSubCategory);
        });
      });
    });
    return csvData;
  }

  async finish(filters: ListFieldsFileRequest) {
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

  isSouthAmericaLossFile(filters: ListFieldsFileRequest) {
    const { listView, type } = filters;
    return listView === 'forest_change' && (type === 'southAmericaTCL' || type === 'everything');
  }
}
