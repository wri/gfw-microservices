import { Injectable } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { argentinaLayers } from '../parser/argentina.layers.parser';
import { FormatNumber } from '../transform/format.number';

@Injectable()
export class ArgentinaOverlapService extends DashboardHandleDownload {
  start(filters: GenerationFileRequest) {
    if (this.isArgentinaOverlapFile(filters)) {
      super.start(filters, 'argentinaOverlap', 'argentina_overlap');
    }
  }

  process(data, filters: GenerationFileRequest) {
    if (this.isArgentinaOverlapFile(filters)) {
      super.process(data, filters);
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

  async finish(filters: GenerationFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isArgentinaOverlapFile(filters)) {
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

  isArgentinaOverlapFile(filters: GenerationFileRequest) {
    const { type } = filters;
    return type === 'argentinaOverlap' || type === 'everything';
  }
}
