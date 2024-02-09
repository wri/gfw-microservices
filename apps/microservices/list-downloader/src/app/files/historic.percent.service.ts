import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

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
  start(filters: ListFieldsFileRequest) {
    if (this.isHistoricPercentFile(filters)) {
      super.start(filters, 'historicPercent', 'sensitive_areas_percentage_historic_area_lost');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isHistoricPercentFile(filters)) {
      super.process(data, filters);
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    const csvData = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

    EXCEL_TEMPLATES[table].forEach((key) => {
      const dataRow = [list_name];

      key.numerators.forEach((field) => {
        const currentRow = cloneRow(dataRow);
        const tclOnAttribute = parseListData(field.tclAttribute, [listLevelAnalysis]);
        const attributeExtent = parseListTotals(field.extentAttribute, listLevelAnalysis);

        const percent = formatPct(validatePct((tclOnAttribute / attributeExtent) * 100));

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

  async finish(filters: ListFieldsFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isHistoricPercentFile(filters)) {
      this.logger.log('Historic Percent Finish');
      if (selectedLocationsList.length != 1) {
        generateCSV(
          filters,
          'historicPercentAggregate',
          'sensitive_areas_percentage_historic_area_lost_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
  }

  isHistoricPercentFile(filters: ListFieldsFileRequest) {
    const { listView, type } = filters;
    return listView === 'forest_change' && (type === 'historicPercent' || type === 'everything');
  }
}
