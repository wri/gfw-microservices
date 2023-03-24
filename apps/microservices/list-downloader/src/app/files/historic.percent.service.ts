import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import {
  cloneRow,
  formatPct,
  validatePct,
  parseListData,
  parseListTotals,
} from '../shared/functions';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';

@Injectable()
export class HistoricPercentService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'historicPercent' || type == 'everything')
    ) {
      super.start(
        filters,
        'historicPercent',
        'sensitive_areas_percentage_historic_area_lost'
      );
    }
  }

  process(data: any, filters: GenerationFileRequest) {
    const { listView, type } = filters;
    if (
      listView === 'forest_change' &&
      (type == 'historicPercent' || type == 'everything')
    ) {
      super.process(data, filters);
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis: any) {
    const csvData = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

    EXCEL_TEMPLATES[table].forEach((key) => {
      const dataRow = [list_name];

      key.numerators.forEach((field) => {
        const currentRow = cloneRow(dataRow);
        const tclOnAttribute = parseListData(field.tclAttribute, [
          listLevelAnalysis,
        ]);
        const attributeExtent = parseListTotals(
          field.extentAttribute,
          listLevelAnalysis
        );

        const percent = formatPct(
          validatePct((tclOnAttribute / attributeExtent) * 100)
        );

        if (field.label) {
          currentRow.push(field.label);
        }
        currentRow.push(percent);
        currentRow.push(tclOnAttribute);
        currentRow.push(attributeExtent);

        csvData.push(currentRow);
      });
    });
    return csvData;
  }

  finish(filters: GenerationFileRequest) {
    this.logger.log('Historic Percent Finish');
    const { listView, selectedLocationsList, type } = filters;
    if (
      listView === 'forest_change' &&
      selectedLocationsList.length != 1 &&
      (type == 'historicPercent' || type == 'everything')
    ) {
      generateCSV(
        filters,
        'historicPercentAggregate',
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        this.generateAggregate
      );
    }
  }
}
