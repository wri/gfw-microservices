import { ArgentinaOTBNStrategy } from './argentina-otbn.strategy';
import { BrazilBiomesStrategy } from './brazil-biomes.strategy';
import DefaultStrategy from './default.strategy';

type Field = {
  label: string;
};


export interface SouthAmericaLossAggregateStrategy {
  // TODO: Remove any and validate types
  processLabel(
    field: Field,
    rowValue: number,
    year: string,
    dataRow: string[],
    csvData: Array<Array<unknown>>,
    totalSubCategory: number
  ): void;
}

const labelStrategies = {
  'Brazil Biomes': new BrazilBiomesStrategy(),
  'Argentina OTBN': new ArgentinaOTBNStrategy(),
  default: new DefaultStrategy(), //handle the cases where the analysis is not comming from argentina nor brazil
};

export default class SouthAmericaLossAggregateHandler {
  constructor(private label: string) {}
  // TODO: Remove any and validate types
  processLabel(
    field: Field,
    rowValue: number,
    year: string,
    dataRow: string[],
    csvData: Array<Array<unknown>>,
    totalSubCategory = 0
  ): void {
    const labelStrategy =
      labelStrategies[this.label] || labelStrategies['default'];
    labelStrategy.processLabel(
      field,
      rowValue,
      year,
      dataRow,
      csvData,
      totalSubCategory
    );
  }
}
