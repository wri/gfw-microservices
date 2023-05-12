import { SouthAmericaLossAggregateStrategy } from '.';
import { TreeCoverLossAggregateStrategy } from './tree-cover-loss.strategy';

export class BrazilBiomesStrategy implements SouthAmericaLossAggregateStrategy {
  processLabel(
    field: any,
    rowValue: any,
    year: any,
    dataRow: any,
    csvData: any,
    totalSubCategory: any = 0
  ): void {
    const treeCoverLossAggregateStrategy = new TreeCoverLossAggregateStrategy({
      dataLayer: 'Brazil Biomes',
    });
    treeCoverLossAggregateStrategy.processLabel(
      field,
      rowValue,
      year,
      dataRow,
      csvData,
      totalSubCategory
    );
  }
}
