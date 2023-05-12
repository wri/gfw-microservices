import { SouthAmericaLossAggregateStrategy } from '.';
import { TreeCoverLossAggregateStrategy } from './tree-cover-loss.strategy';

export class ArgentinaOTBNStrategy
  implements SouthAmericaLossAggregateStrategy
{
  processLabel(
    field: any,
    rowValue: any,
    year: any,
    dataRow: any,
    csvData: any,
    totalSubCategory: any = 0
  ): void {
    const treeCoverLossAggregateStrategy = new TreeCoverLossAggregateStrategy({
      dataLayer: 'Argentina OTBN',
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
