import { Injectable, Scope } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { argentinaLayers } from '../parser/argentina.layers.parser';
import { FormatNumber } from '../transform/format.number';
import { shouldGenerateArgentinaCsv } from '../shared/functions';

@Injectable({
  scope: Scope.REQUEST,
})
export class ArgentinaOverlapService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (shouldGenerateArgentinaCsv(filters)) {
      super.start(filters, 'argentinaOverlap', 'argentina_overlap');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (shouldGenerateArgentinaCsv(filters)) {
      super.process(data, filters);
    }
  }

  async finish(filters: ListFieldsFileRequest) {
    const { selectedLocationsList } = filters;

    if (shouldGenerateArgentinaCsv(filters)) {
      this.logger.log('Argentina Overlap Service finish');
      if (selectedLocationsList.length != 1) {
        generateCSV(
          filters,
          'argentinaOverlapAggregate',
          'argentina_overlap_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    let csvData = [];
    const dataRow = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

    EXCEL_TEMPLATES[table].forEach((column) => {
      const { name } = column;
      if (name === 'list_name') {
        dataRow.push(list_name);
      } else {
        argentinaLayers({
          operation: column,
          dataRow,
          data: listLevelAnalysis,
          csvData,
        });
      }
    });

    const formatter = new FormatNumber();
    csvData = formatter.run(csvData);

    return csvData;
  }
}
