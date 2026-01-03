import { SouthAmericaLossAggregateStrategy } from '.';
import { DATA_LAYER } from '../../../shared/constants';
import { TreeCoverLossAggregateStrategy } from './tree-cover-loss.strategy';
import { StrategyFieldType } from './type';

export class ArgentinaOTBNStrategy implements SouthAmericaLossAggregateStrategy {
  // TODO: Remove any and validate types
  processLabel(
    field: StrategyFieldType,
    rowValue: number,
    year: string,
    dataRow: string[],
    csvData: Array<Array<unknown>>,
    totalSubCategory = 0
  ): void {
    const treeCoverLossAggregateStrategy = new TreeCoverLossAggregateStrategy({
      dataLayer: DATA_LAYER.argentina_otbn,
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
