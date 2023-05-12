import { SouthAmericaLossAggregateStrategy } from '.';
import { cloneRow } from '../../../shared/functions';

export class TreeCoverLossAggregateStrategy
  implements SouthAmericaLossAggregateStrategy
{
  constructor(private params: any) {}

  processLabel(
    field: any,
    rowValue: any,
    year: any,
    dataRow: any,
    csvData: any,
    totalSubCategory: any = 0
  ): void {
    let totalBiomeValue = 0;
    Object.keys(rowValue).forEach((biomeYearFirst) => {
      totalBiomeValue += rowValue[biomeYearFirst];
    });
    console.log(this.params.dataLayer, rowValue)
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
