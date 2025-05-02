import * as fs from 'fs';
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

      // Checks if list has been analyzed before new analysis was implemented
      const isAnalysisObsolete = this.checkIfAnalysisIsObsolete(filters);
      if (isAnalysisObsolete) {
        this.writeCsvErrorHeader(filters, 'argentina_overlap');
      }
    }
  }

  process(data, filters: ListFieldsFileRequest) {
    const isAnalysisObsolete = this.checkIfAnalysisIsObsolete(filters);

    if (shouldGenerateArgentinaCsv(filters) && !isAnalysisObsolete) {
      super.process(data, filters);
    }
  }

  protected writeCsvErrorHeader(filters: ListFieldsFileRequest, fileSuffix: string) {
    const filePath = `/tmp/wri-${filters.key}/${filters.listName}_${fileSuffix}.csv`;
    const errorHeader = `"error"`;
    const errorMessage = `"Error details: list '${filters.listName}' has been analyzed using an obsolete process."`;

    fs.writeFileSync(filePath, `${errorHeader}\n${errorMessage}\n`);
  }

  checkIfAnalysisIsObsolete(filters: ListFieldsFileRequest): boolean {
    return filters.listLevelAnalysis?.country_area === null;
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
}
