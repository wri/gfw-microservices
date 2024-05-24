import { Injectable } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';

import { DashboardHandleDownload } from '../pipe/dashboard.handle.download';
import { generateCSV } from '../shared/generate.csv';
import { argentinaLossOfForests } from '../parser/argentina-loss-of-forests-parser';
import { EXCEL_TEMPLATES, EXCEL_TEMPLATE_HEADERS } from '../shared/constants';

@Injectable()
export class ArgentinaLossOfForestsService extends DashboardHandleDownload {
  start(filters: ListFieldsFileRequest) {
    if (this.isForestLossFile(filters)) {
      super.start(filters, 'argentinaLossOfForests', 'argentina_loss_of_forests');
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    if (this.isForestLossFile(filters)) {
      super.process(data, filters);
    }
  }

  generateAggregate(table: string, list_name: string, listLevelAnalysis) {
    const csvData = [];
    const dataRow = [];
    csvData.push(EXCEL_TEMPLATE_HEADERS[table]);

    EXCEL_TEMPLATES[table].forEach((column) => {
      const { name } = column;
      if (name === 'list_name') {
        dataRow.push(list_name);
      } else {
        argentinaLossOfForests({
          operation: column,
          dataRow,
          data: listLevelAnalysis,
          csvData,
        });
      }
    });

    // const formatter = new FormatNumber();
    // csvData = formatter.run(csvData);

    return csvData;
  }

  async finish(filters: ListFieldsFileRequest) {
    const { selectedLocationsList } = filters;
    if (this.isForestLossFile(filters)) {
      this.logger.log('Loss of forest finish');
      if (selectedLocationsList.length != 1) {
        generateCSV(
          filters,
          'argentinaLossOfForestsAggregate',
          'argentina_loss_of_forests_aggregate',
          this.generateAggregate
        );
      }
      await super.finish(filters);
    }
  }

  isForestLossFile(filters: ListFieldsFileRequest) {
    const { listView, type } = filters;
    return listView === 'forest_change' && (type === 'southAmericaTCL' || type === 'everything');
  }
}
