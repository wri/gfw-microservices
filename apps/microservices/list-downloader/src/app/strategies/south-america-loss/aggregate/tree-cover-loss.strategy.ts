import { SouthAmericaLossAggregateStrategy } from '.';
import { cloneRow } from '../../../shared/functions';
import { StrategyFieldType } from './type';

export class TreeCoverLossAggregateStrategy implements SouthAmericaLossAggregateStrategy {
  // TODO: Remove any and validate types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private params: any) {}

  processLabel(
    field: StrategyFieldType,
    rowValue: number,
    year: string,
    dataRow: string[],
    csvData: Array<Array<unknown>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    totalSubCategory = 0
  ): void {
    let totalBiomeValue = 0;
    Object.keys(rowValue).forEach((biomeYearFirst) => {
      totalBiomeValue += rowValue[biomeYearFirst];
    });
    Object.keys(rowValue).forEach((biomeYear) => {
      const currentBrazilianRow = cloneRow(dataRow);
      currentBrazilianRow.push(`${this.params.dataLayer} - ${year}`);
      currentBrazilianRow.push(rowValue[biomeYear]);
      currentBrazilianRow.push(biomeYear);
      currentBrazilianRow.push(totalBiomeValue.toFixed(2));
      csvData.push(currentBrazilianRow);
    });
  }
}
