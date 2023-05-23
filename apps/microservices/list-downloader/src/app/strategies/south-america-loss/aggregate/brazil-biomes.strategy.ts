import { SouthAmericaLossAggregateStrategy } from '.';
import { DATA_LAYER } from '../../../shared/constants';
import { TreeCoverLossAggregateStrategy } from './tree-cover-loss.strategy';

type Field = {
  label: string;
};

export class BrazilBiomesStrategy implements SouthAmericaLossAggregateStrategy {
  // TODO: Remove any and validate types
  processLabel(
    field: Field,
    rowValue: number,
    year: string,
    dataRow: string[],
    csvData: Array<Array<unknown>>,
    totalSubCategory = 0
  ): void {
    const treeCoverLossAggregateStrategy = new TreeCoverLossAggregateStrategy({
      dataLayer: DATA_LAYER.brazil_biomes,
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
