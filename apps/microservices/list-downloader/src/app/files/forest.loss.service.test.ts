import { ForestLossService } from './forest.loss.service';

describe('Forest Loss Service', () => {
  let forestLossService: ForestLossService;

  beforeEach(() => {
    forestLossService = new ForestLossService();
  });

  test('Receive an empty input and return just the header', () => {
    const returnData = forestLossService.generateAggregate(
      'forestLossAggregate',
      'sensitive_areas_loss_of_forests_aggregate',
      { tree_cover_loss_total_yearly: '{}' }
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        'Forest Loss (ha)',
        'Year',
        'Loss (all years) (ha)',
        '% of TCL',
      ],
    ]);
  });

  test('Receive tree_cover_loss_total_yearly return one line for each year', () => {
    const returnData = forestLossService.generateAggregate(
      'forestLossAggregate',
      'sensitive_areas_loss_of_forests_aggregate',
      { tree_cover_loss_total_yearly: '{ "2010": 2, "2011": 3, "2012": 4}' }
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        'Forest Loss (ha)',
        'Year',
        'Loss (all years) (ha)',
        '% of TCL',
      ],
      ['sensitive_areas_loss_of_forests_aggregate', 'Tree Cover Loss', 2, '2010', 9, '22.22'],
      ['sensitive_areas_loss_of_forests_aggregate', 'Tree Cover Loss', 3, '2011', 9, '33.33'],
      ['sensitive_areas_loss_of_forests_aggregate', 'Tree Cover Loss', 4, '2012', 9, '44.44'],
    ]);
  });

  test('Receive tree_cover_loss_total_yearly and tree_cover_loss_primary_forest_yearly combine rows', () => {
    const returnData = forestLossService.generateAggregate(
      'forestLossAggregate',
      'sensitive_areas_loss_of_forests_aggregate',
      {
        tree_cover_loss_total_yearly: '{ "2010": 2 }',
        tree_cover_loss_primary_forest_yearly: '{ "2011": 2 }',
      }
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        'Forest Loss (ha)',
        'Year',
        'Loss (all years) (ha)',
        '% of TCL',
      ],
      ['sensitive_areas_loss_of_forests_aggregate', 'Tree Cover Loss', 2, '2010', 2, '100.00'],
      ['sensitive_areas_loss_of_forests_aggregate', 'Primary Forest', 2, '2011', 2, '100.00'],
    ]);
  });

  test('Receive an empty analysis data', () => {
    const returnData = forestLossService.generateAggregate(
      'forestLossAggregate',
      'sensitive_areas_loss_of_forests_aggregate',
      {}
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        'Forest Loss (ha)',
        'Year',
        'Loss (all years) (ha)',
        '% of TCL',
      ],
    ]);
  });

  test('Receive an undefined analysis data', () => {
    const returnData = forestLossService.generateAggregate(
      'forestLossAggregate',
      'sensitive_areas_loss_of_forests_aggregate',
      undefined
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        'Forest Loss (ha)',
        'Year',
        'Loss (all years) (ha)',
        '% of TCL',
      ],
    ]);
  });
});
