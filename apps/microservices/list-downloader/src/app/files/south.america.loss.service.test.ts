import { SouthAmericaLossService } from './south.america.loss.service';

describe('South America Loss Service', () => {
  let southAmericaLossService: SouthAmericaLossService;

  beforeEach(() => {
    southAmericaLossService = new SouthAmericaLossService();
  });

  test('Receive an empty input and return just the header', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: '{}',
        tree_cover_loss_total_yearly: '{}',
        tree_cover_loss_brazil_biomes_yearly: '{}',
        tree_cover_loss_prodes_yearly: '{}',
        tree_cover_loss_prodes_primary_forest_yearly: '{}',
        tree_cover_loss_prodes_wdpa_yearly: '{}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive an input with just one year', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: '{"2018": 30}',
        tree_cover_loss_total_yearly: '{"2018": 20}',
        tree_cover_loss_brazil_biomes_yearly: '{"2018": 20}',
        tree_cover_loss_prodes_yearly: '{"2018": 20}',
        tree_cover_loss_prodes_primary_forest_yearly: '{"2018": 20}',
        tree_cover_loss_prodes_wdpa_yearly: '{"2018": 20}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_america_loss_of_forests_aggregate', 'Soy on Tree Cover Loss', 30, '2018', '30.00'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 20, '2018', '20.00'],
      ['south_america_loss_of_forests_aggregate', 'PRODES', 20, '2018', '20.00'],
      ['south_america_loss_of_forests_aggregate', 'Primary Forest', 20, '2018', '20.00'],
      ['south_america_loss_of_forests_aggregate', 'Protected Areas', 20, '2018', '20.00'],
    ]);
  });

  test('Receive an input with two year', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: '{"2018": 30, "2019": 20}',
        tree_cover_loss_total_yearly: '{"2018": 20, "2019": 10}',
        tree_cover_loss_brazil_biomes_yearly: '{"2018": 20, "2019": 30}',
        tree_cover_loss_prodes_yearly: '{"2018": 20, "2019": 20}',
        tree_cover_loss_prodes_primary_forest_yearly: '{"2018": 20, "2019": 15}',
        tree_cover_loss_prodes_wdpa_yearly: '{"2018": 20, "2019": 10}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_america_loss_of_forests_aggregate', 'Soy on Tree Cover Loss', 30, '2018', '50.00'],
      ['south_america_loss_of_forests_aggregate', 'Soy on Tree Cover Loss', 20, '2019', '50.00'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 20, '2018', '30.00'],
      ['south_america_loss_of_forests_aggregate', 'Tree Cover Loss', 10, '2019', '30.00'],
      ['south_america_loss_of_forests_aggregate', 'PRODES', 20, '2018', '40.00'],
      ['south_america_loss_of_forests_aggregate', 'PRODES', 20, '2019', '40.00'],
      ['south_america_loss_of_forests_aggregate', 'Primary Forest', 20, '2018', '35.00'],
      ['south_america_loss_of_forests_aggregate', 'Primary Forest', 15, '2019', '35.00'],
      ['south_america_loss_of_forests_aggregate', 'Protected Areas', 20, '2018', '30.00'],
      ['south_america_loss_of_forests_aggregate', 'Protected Areas', 10, '2019', '30.00'],
    ]);
  });

  test('Receive an input empty object', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {}
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive an undefined input', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      undefined
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive a property with null', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'sAmericaLossAggregate',
      'south_america_loss_of_forests_aggregate',
      {
        tree_cover_loss_soy_yearly: null,
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });
});
