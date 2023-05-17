import { SouthAmericaLossAggregateStrategy } from '.';
import { DATA_LAYER } from '../../../shared/constants';
import { TreeCoverLossAggregateStrategy } from './tree-cover-loss.strategy';

export class ArgentinaOTBNStrategy
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
    const treeCoverLossAggregateStrategy = new TreeCoverLossAggregateStrategy({
      dataLayer: DATA_LAYER.arg_otbn_area,
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

//tree_cover_loss_arg_otbn_yearly
