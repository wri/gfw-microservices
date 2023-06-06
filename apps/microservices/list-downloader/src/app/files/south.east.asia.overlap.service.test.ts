import { SouthAmericaLossService } from './south.america.loss.service';

describe('South East Asia Overlap Service', () => {
  let southAmericaLossService: SouthAmericaLossService;

  beforeEach(() => {
    southAmericaLossService = new SouthAmericaLossService();
  });

  test('Receive an empty input and return just the header', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      {
        tree_cover_loss_total_yearly: '{}',
        tree_cover_loss_sea_landcover_yearly: '{}',
        tree_cover_loss_idn_landcover_yearly: '{}',
        tree_cover_loss_idn_legal_yearly: '{}',
        tree_cover_loss_idn_forest_moratorium_yearly: '{}',
        tree_cover_loss_idn_primary_forest_yearly: '{}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive one year', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      {
        tree_cover_loss_total_yearly: '{"2018": 30}',
        tree_cover_loss_sea_landcover_yearly: '{"2018": 20}',
        tree_cover_loss_idn_landcover_yearly: '{"2018": 30}',
        tree_cover_loss_idn_legal_yearly: '{"2018": 20}',
        tree_cover_loss_idn_forest_moratorium_yearly: '{"2018": 50}',
        tree_cover_loss_idn_primary_forest_yearly: '{"2018": 40}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_east_asia_tcl_aggregate', 'Tree Cover Loss', 30, '2018', '30.00'],
      ['south_east_asia_tcl_aggregate', 'Southeast Asia Landcover', 20, '2018', '20.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Landcover', 30, '2018', '30.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Legal Classification', 20, '2018', '20.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Forest Moratorium', 50, '2018', '50.00'],
      ['south_east_asia_tcl_aggregate', 'Primary Forest', 40, '2018', '40.00'],
    ]);
  });

  test('Receive two years', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      {
        tree_cover_loss_total_yearly: '{"2018": 30, "2019": 20}',
        tree_cover_loss_sea_landcover_yearly: '{"2018": 20, "2019": 30}',
        tree_cover_loss_idn_landcover_yearly: '{"2018": 30, "2019": 40}',
        tree_cover_loss_idn_legal_yearly: '{"2018": 20, "2019": 30}',
        tree_cover_loss_idn_forest_moratorium_yearly: '{"2018": 50, "2019": 30}',
        tree_cover_loss_idn_primary_forest_yearly: '{"2018": 40, "2019": 30}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_east_asia_tcl_aggregate', 'Tree Cover Loss', 30, '2018', '50.00'],
      ['south_east_asia_tcl_aggregate', 'Tree Cover Loss', 20, '2019', '50.00'],
      ['south_east_asia_tcl_aggregate', 'Southeast Asia Landcover', 20, '2018', '50.00'],
      ['south_east_asia_tcl_aggregate', 'Southeast Asia Landcover', 30, '2019', '50.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Landcover', 30, '2018', '70.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Landcover', 40, '2019', '70.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Legal Classification', 20, '2018', '50.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Legal Classification', 30, '2019', '50.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Forest Moratorium', 50, '2018', '80.00'],
      ['south_east_asia_tcl_aggregate', 'Indonesia Forest Moratorium', 30, '2019', '80.00'],
      ['south_east_asia_tcl_aggregate', 'Primary Forest', 40, '2018', '70.00'],
      ['south_east_asia_tcl_aggregate', 'Primary Forest', 30, '2019', '70.00'],
    ]);
  });

  test('Receive an empty object ', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      {}
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive an undefined data', () => {
    const returnData = southAmericaLossService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      undefined
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });
});
