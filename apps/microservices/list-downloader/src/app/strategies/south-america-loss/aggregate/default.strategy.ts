import { SouthAmericaLossAggregateStrategy } from '.';
import { cloneRow } from '../../../shared/functions';

export default class DefaultStrategy
  implements SouthAmericaLossAggregateStrategy {
  // TODO: Remove any and validate types
  processLabel(
    field: any,
    rowValue: any,
    year: any,
    dataRow: any,
    csvData: any,
    totalSubCategory: any = 0
  ): void {
    if (totalSubCategory > 0) {
      const nestedRow = cloneRow(dataRow);
      nestedRow.push(field.label);
      nestedRow.push(rowValue);
      nestedRow.push(year);
      nestedRow.push(totalSubCategory.toFixed(2));
      csvData.push(nestedRow);
    }
  }
}
