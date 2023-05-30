import { SouthAmericaLossAggregateStrategy } from '.';
import { cloneRow } from '../../../shared/functions';
import { StrategyFieldType } from './type';

export default class DefaultStrategy implements SouthAmericaLossAggregateStrategy {
  // TODO: Remove any and validate types
  processLabel(
    field: StrategyFieldType,
    rowValue: number,
    year: string,
    dataRow: string[],
    csvData: Array<Array<unknown>>,
    totalSubCategory = 0
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
