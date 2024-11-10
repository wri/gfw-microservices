import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';
import { FormatNumber } from '../transform/format.number';
import { colombiaLayers } from '../parser/colombia-layers-parser';
import { shouldGenerateColombiaCsv } from '../shared/functions';

@Injectable()
export class ColombiaDeforestationService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (shouldGenerateColombiaCsv(filters)) {
      super.start(filters, 'colombiaDeforestation', 'colombia_loss_of_forests');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (shouldGenerateColombiaCsv(filters)) {
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
        colombiaLayers({
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

  async finish(filters: ListFieldsFileRequest) {
    const { selectedLocationsList } = filters;
    if (shouldGenerateColombiaCsv(filters)) {
      this.logger.log('Colombia Deforestation Service finish');
      if (selectedLocationsList.length != 1) {
        generateCSV(
          filters,
          'colombiaDeforestationAggregate',
          'colombia_loss_of_forests_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
  }
}
