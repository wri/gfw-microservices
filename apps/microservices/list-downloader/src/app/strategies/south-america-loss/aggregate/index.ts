import { ArgentinaOTBNStrategy } from './argentina-otbn.strategy';
import { BrazilBiomesStrategy } from './brazil-biomes.strategy';
import DefaultStrategy from './default.strategy';

export interface SouthAmericaLossAggregateStrategy {
  // TODO: Remove any and validate types
  processLabel(
    field: any,
    rowValue: any,
    year: any,
    dataRow: any,
    csvData: any,
    totalSubCategory: any
  ): void;
}

const labelStrategies = {
  'Brazil Biomes': new BrazilBiomesStrategy(),
  'Argentina OTBN': new ArgentinaOTBNStrategy(),
  default: new DefaultStrategy(),//handle the cases where the analysis is not comming from argentina nor brazil
};

export default class SouthAmericaLossAggregateHandler {
  constructor (private label: string) { }
  // TODO: Remove any and validate types
  processLabel(
    field: any,
    rowValue: any,
    year: any,
    dataRow: any,
    csvData: any,
    totalSubCategory: any
  ): void {
    const labelStrategy =
      labelStrategies[this.label] || labelStrategies['default'];
    labelStrategy.processLabel(field, rowValue, year, dataRow, csvData, totalSubCategory);
  }
}
