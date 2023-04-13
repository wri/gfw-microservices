import { Transform } from 'stream';

import { TemplateOperation } from '../shared/model';

import { overheadParser } from './overhead.parser';
import { percentParser } from './percent.parser';
import { totalParser } from './total.parser';
import { yearlyParser } from './yearly.parser';

class ManipulateDataForDashboard extends Transform {
  constructor(
    private templateOperations: TemplateOperation,
    private listLevelAnalysis: any
  ) {
    super({ objectMode: true });
  }

  _transform(data, _, next) {
    const csvData = [];
    const dataRow = [];
    this.templateOperations.forEach((operation) => {
      if (operation.parsed === 'overhead') {
        overheadParser(
          operation,
          dataRow,
          data,
          csvData,
          this.listLevelAnalysis
        );
      } else if (operation.parsed === 'total') {
        totalParser(operation, dataRow, data);
      } else if (operation.parsed === 'yearly') {
        yearlyParser(operation, dataRow, data, csvData);
      } else if (operation.parsed === 'percent') {
        percentParser(operation, dataRow, data, csvData);
      }
    });
    //console.log(dataRow)
    const result = [...csvData];

    if (dataRow.length > 0) {
      result.push(dataRow);
    }

    next(null, result);
  }
}

export { ManipulateDataForDashboard };
