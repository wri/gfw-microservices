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
export class SouthEastAsiaOverlapService extends DashboardHandleDownload {
  private existSouthEastLocation = false;

  start(filters: GenerationFileRequest) {
    if (this.isSouthEastAsiaOverlapFile(filters)) {
      super.start(filters, 'seAsiaOverlap', 'south_east_asia_overlap');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isSouthEastAsiaOverlapFile(filters)) {
      const locations = data.filter(
        (location) => location.southeast_asia_presence === 'true'
      );
      if (locations && locations.length > 0) {
        this.existSouthEastLocation = true;
        super.process(locations, filters);
      }
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

        if (totalStatValue > 0) {
          if (!listLevelAnalysis[field.attribute]) {
            return;
          }

          const yearlyData = JSON.parse(listLevelAnalysis[field.attribute]);

          if (isNaN(parseInt(yearlyData)) === true) {
            Object.keys(yearlyData).forEach((location) => {
              const currentRow = cloneRow(dataRow);
              currentRow.push(field.label);
              currentRow.push(location);
              const percent = formatPct(
                validatePct((yearlyData[location] / totalStatValue) * 100)
              );
              currentRow.push(percent);
              csvData.push(currentRow);
            });
          } else {
            const currentRowIn = cloneRow(dataRow);
            currentRowIn.push(field.label);
            currentRowIn.push('Within Forest Moratorium');
            const percentIn = formatPct(
              validatePct((yearlyData / listLevelAnalysis.total_area) * 100)
            );
            currentRowIn.push(percentIn);
            csvData.push(currentRowIn);

            const hectaresOut = listLevelAnalysis.total_area - yearlyData;

            const currentRowOut = cloneRow(dataRow);
            currentRowOut.push(field.label);
            currentRowOut.push('Outside Forest Moratorium');
            const percentOut = formatPct(
              validatePct((hectaresOut / listLevelAnalysis.total_area) * 100)
            );
            currentRowOut.push(percentOut);
            csvData.push(currentRowOut);
          }
        }
      });
    });
    return csvData;
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('South East Asia Overlap Finish');
    const { selectedLocationsList } = filters;
    if (
      this.isSouthEastAsiaOverlapFile(filters) &&
      selectedLocationsList.length != 1 &&
      this.existSouthEastLocation
    ) {
      generateCSV(
        filters,
        'seAsiaOverlapAggregate',
        'south_east_asia_overlap_aggregate',
        this.generateAggregate
      );
    }
    this.existSouthEastLocation = false;
  }

  isSouthEastAsiaOverlapFile(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'forest_change' &&
      (type === 'southEastAsiaOverlap' || type === 'everything')
    );
  }
}
