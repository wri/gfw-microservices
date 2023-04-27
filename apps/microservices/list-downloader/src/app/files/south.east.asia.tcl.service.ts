import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { cloneRow, parseListData } from '../shared/functions';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class SouthEastAsiaTCLService extends DashboardHandleDownload {
  private existSouthEastLocation = false;

  start(filters: GenerationFileRequest) {
    if (this.isSouthEastAsiaTCL(filters)) {
      super.start(filters, 'seAsiaTCL', 'south_east_asia_tcl');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isSouthEastAsiaTCL(filters)) {
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
        const { label, attribute } = field as {
          label: string;
          attribute: string;
        };
        const totalStatValue = parseListData(attribute, [listLevelAnalysis]);
        const dataRow = [list_name];

        let rowValue = 0;
        if (!listLevelAnalysis[attribute]) {
          return;
        }
        const yearlyData = JSON.parse(listLevelAnalysis[attribute]);

        Object.keys(yearlyData).forEach((year) => {
          const currentRow = cloneRow(dataRow);
          rowValue = yearlyData[year];

          if (isNaN(rowValue) === true) {
            let totalSubCategory = 0;
            Object.keys(rowValue).forEach((yr) => {
              totalSubCategory += rowValue[yr];
            });

            if (totalSubCategory > 0) {
              Object.keys(rowValue).forEach((location) => {
                const nestedRow = cloneRow(dataRow);
                nestedRow.push(`${label} - ${year}`);
                nestedRow.push(rowValue[location]);
                nestedRow.push(location);
                nestedRow.push(totalSubCategory);
                csvData.push(nestedRow);
              });
            }
          } else {
            currentRow.push(label);
            currentRow.push(rowValue);
            currentRow.push(year);
            currentRow.push(totalStatValue);
            csvData.push(currentRow);
          }
        });
      });
    });
    return csvData;
  }

  async finish(filters: GenerationFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isSouthEastAsiaTCL(filters)) {
      this.logger.log('Finish South East Asia TCL');
      if (selectedLocationsList.length != 1 && this.existSouthEastLocation) {
        generateCSV(
          filters,
          'seAsiaTCLAggregate',
          'south_east_asia_tcl_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
    this.existSouthEastLocation = false;
  }

  isSouthEastAsiaTCL(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    return (
      listView === 'forest_change' &&
      (type === 'southEastAsiaTCL' || type === 'everything')
    );
  }
}
