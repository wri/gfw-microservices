import { SouthAmericaLossAggregateStrategy } from '.';
import { cloneRow } from '../../../shared/functions';

type Field = {
  label: string;
};

type ParametersType = {
  dataLayer: string;
}


export class TreeCoverLossAggregateStrategy
  implements SouthAmericaLossAggregateStrategy
{
  constructor(private params: ParametersType) {}
  // TODO: Remove any and validate types
  processLabel(
    field: Field,
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
