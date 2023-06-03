import { Transform } from 'stream';

import { TemplateOperation } from '../shared/model';

import { overheadParser } from '../parser/overhead.parser';
import { percentParser } from '../parser/percent.parser';
import { totalParser } from '../parser/total.parser';
import { yearlyParser } from '../parser/yearly.parser';

class ManipulateDataForDashboard extends Transform {
  constructor(private templateOperations: TemplateOperation, private listLevelAnalysis) {
    super({ objectMode: true });
  }

  _transform(data, _, next) {
    const csvData = [];
    const dataRow = [];
    this.templateOperations.forEach((operation) => {
      if (operation.parsed === 'overhead') {
        overheadParser({
          operation,
          listLevelAnalysis: this.listLevelAnalysis,
          data,
          dataRow,
          csvData,
        });
      } else if (operation.parsed === 'total') {
        totalParser({ operation, data, dataRow });
      } else if (operation.parsed === 'yearly') {
        yearlyParser({ operation, data, dataRow, csvData });
      } else if (operation.parsed === 'percent') {
        percentParser({ operation, data, dataRow, csvData });
      }
    });
    const result = [...csvData];

    if (dataRow.length > 0) {
      result.push(dataRow);
    }

    next(null, result);
  }
}

export { ManipulateDataForDashboard };
