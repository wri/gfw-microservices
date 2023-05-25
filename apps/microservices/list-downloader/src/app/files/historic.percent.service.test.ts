import { HistoricPercentService } from './historic.percent.service';

describe('Historic Percent Service', () => {
  let historicPercentService: HistoricPercentService;

  beforeEach(() => {
    historicPercentService = new HistoricPercentService();
  });

  test('Receive an empty input and return just the header', () => {
    const returnData = historicPercentService.generateAggregate(
      'historicPercentAggregate',
      'sensitive_areas_percentage_historic_area_lost_aggregate',
      {
        tree_cover_extent_total: '',
        tree_cover_loss_total_yearly: '{}',
        tree_cover_extent_primary_forest: '',
        tree_cover_loss_primary_forest_yearly: '{}',
        tree_cover_extent_protected_areas: '',
        tree_cover_loss_protected_areas_yearly: '{}',
        tree_cover_extent_peat: '',
        tree_cover_loss_peat_yearly: '{}',
        tree_cover_extent_intact_forest: '',
        tree_cover_loss_intact_forest_yearly: '{}',
      }
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        '% of Historic Area Lost',
        'Loss (all years) (ha)',
        'Tree Cover Extent (2000) (ha)',
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Tree Cover Extent',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Primary Forest',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Protected Areas',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Peat',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Intact Forest Landscapes',
        '0.00',
        0,
        0,
      ],
    ]);
  });

  test('Receive historicPercentAggregate receive all fields', () => {
    const returnData = historicPercentService.generateAggregate(
      'historicPercentAggregate',
      'sensitive_areas_percentage_historic_area_lost_aggregate',
      {
        tree_cover_extent_total: '15',
        tree_cover_loss_total_yearly: '{"2021": 5}',
        tree_cover_extent_primary_forest: '11',
        tree_cover_loss_primary_forest_yearly: '{"2021": 6}',
        tree_cover_extent_protected_areas: '19',
        tree_cover_loss_protected_areas_yearly: '{"2021": 7}',
        tree_cover_extent_peat: '20',
        tree_cover_loss_peat_yearly: '{"2021": 8}',
        tree_cover_extent_intact_forest: '21',
        tree_cover_loss_intact_forest_yearly: '{"2021": 9}',
      }
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        '% of Historic Area Lost',
        'Loss (all years) (ha)',
        'Tree Cover Extent (2000) (ha)',
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Tree Cover Extent',
        '33.33',
        5,
        15,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Primary Forest',
        '54.55',
        6,
        11,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Protected Areas',
        '36.84',
        7,
        19,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Peat',
        '40.00',
        8,
        20,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Intact Forest Landscapes',
        '42.86',
        9,
        21,
      ],
    ]);
  });

  test('Receive an empty analysis data', () => {
    const returnData = historicPercentService.generateAggregate(
      'historicPercentAggregate',
      'sensitive_areas_percentage_historic_area_lost_aggregate',
      {}
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        '% of Historic Area Lost',
        'Loss (all years) (ha)',
        'Tree Cover Extent (2000) (ha)',
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Tree Cover Extent',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Primary Forest',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Protected Areas',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Peat',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Intact Forest Landscapes',
        '0.00',
        0,
        0,
      ],
    ]);
  });

  test('Receive an empty analysis data', () => {
    const returnData = historicPercentService.generateAggregate(
      'historicPercentAggregate',
      'sensitive_areas_percentage_historic_area_lost_aggregate',
      undefined
    );
    expect(returnData).toEqual([
      [
        'List Name',
        'Data Layer Name',
        '% of Historic Area Lost',
        'Loss (all years) (ha)',
        'Tree Cover Extent (2000) (ha)',
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Tree Cover Extent',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Primary Forest',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Protected Areas',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Peat',
        '0.00',
        0,
        0,
      ],
      [
        'sensitive_areas_percentage_historic_area_lost_aggregate',
        'Intact Forest Landscapes',
        '0.00',
        0,
        0,
      ],
    ]);
  });
});
