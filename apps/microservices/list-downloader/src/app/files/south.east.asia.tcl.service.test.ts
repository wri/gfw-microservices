import { SouthEastAsiaTCLService } from './south.east.asia.tcl.service';

describe('South East Asia TCL Service', () => {
  let southEastAsiaTCLService: SouthEastAsiaTCLService;

  beforeEach(() => {
    southEastAsiaTCLService = new SouthEastAsiaTCLService();
  });

  test('Receive an empty input and return just the header', () => {
    const returnData = southEastAsiaTCLService.generateAggregate(
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
    const returnData = southEastAsiaTCLService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      {
        tree_cover_loss_total_yearly: '{"2018": 30}',
        tree_cover_loss_sea_landcover_yearly: '{"2018": 20}',
        tree_cover_loss_idn_landcover_yearly: '{"2018": 40}',
        tree_cover_loss_idn_legal_yearly: '{"2018": 20}',
        tree_cover_loss_idn_forest_moratorium_yearly: '{"2018": 10}',
        tree_cover_loss_idn_primary_forest_yearly: '{"2018": 30}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_east_asia_tcl_aggregate', 'Tree Cover Loss', 30, '2018', 30],
      ['south_east_asia_tcl_aggregate', 'Southeast Asia Landcover', 20, '2018', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Landcover', 40, '2018', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Legal Classification', 20, '2018', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Forest Moratorium', 10, '2018', 10],
      ['south_east_asia_tcl_aggregate', 'Primary Forest', 30, '2018', 30],
    ]);
  });

  test('Receive two year', () => {
    const returnData = southEastAsiaTCLService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      {
        tree_cover_loss_total_yearly: '{"2018": 30, "2019": 30}',
        tree_cover_loss_sea_landcover_yearly: '{"2018": 15, "2019": 30}',
        tree_cover_loss_idn_landcover_yearly: '{"2018": 20, "2019": 40}',
        tree_cover_loss_idn_legal_yearly: '{"2018": 30, "2019": 20}',
        tree_cover_loss_idn_forest_moratorium_yearly: '{"2018": 20, "2019": 20}',
        tree_cover_loss_idn_primary_forest_yearly: '{"2018": 10, "2019": 20}',
      }
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
      ['south_east_asia_tcl_aggregate', 'Tree Cover Loss', 30, '2018', 60],
      ['south_east_asia_tcl_aggregate', 'Tree Cover Loss', 30, '2019', 60],
      ['south_east_asia_tcl_aggregate', 'Southeast Asia Landcover', 15, '2018', 0],
      ['south_east_asia_tcl_aggregate', 'Southeast Asia Landcover', 30, '2019', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Landcover', 20, '2018', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Landcover', 40, '2019', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Legal Classification', 30, '2018', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Legal Classification', 20, '2019', 0],
      ['south_east_asia_tcl_aggregate', 'Indonesia Forest Moratorium', 20, '2018', 40],
      ['south_east_asia_tcl_aggregate', 'Indonesia Forest Moratorium', 20, '2019', 40],
      ['south_east_asia_tcl_aggregate', 'Primary Forest', 10, '2018', 30],
      ['south_east_asia_tcl_aggregate', 'Primary Forest', 20, '2019', 30],
    ]);
  });

  test('Receive an empty object', () => {
    const returnData = southEastAsiaTCLService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      {}
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });

  test('Receive an undefined data', () => {
    const returnData = southEastAsiaTCLService.generateAggregate(
      'seAsiaTCLAggregate',
      'south_east_asia_tcl_aggregate',
      undefined
    );
    expect(returnData).toEqual([
      ['List Name', 'Data Layer Name', 'Forest Loss (ha)', 'Year', 'Total Loss (ha)'],
    ]);
  });
});
