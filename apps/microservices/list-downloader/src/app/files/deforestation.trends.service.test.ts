import { DeforestationTrendsService } from './deforestation.trends.service';

describe('Deforestation Trends Aggregate data', () => {
  let deforestationTrendsService: DeforestationTrendsService;

  beforeEach(() => {
    deforestationTrendsService = new DeforestationTrendsService();
  });

  test('Receive an empty input data, just return the header', () => {
    const returnData = deforestationTrendsService.generateAggregate('table', 'list_name', {
      commodity_threat_deforestation: '{}',
    });
    expect(returnData).toEqual([['List Name', 'Loss (thousand ha)', 'Year']]);
  });

  test('Receive an input with just one element and return it in an aggregate', () => {
    const returnData = deforestationTrendsService.generateAggregate('table', 'list_name', {
      commodity_threat_deforestation: '{"2010": 1.2345}',
    });
    expect(returnData).toEqual([
      ['List Name', 'Loss (thousand ha)', 'Year'],
      ['list_name', '1.2345', '2010'],
    ]);
  });

  test('Receive an input with just two element and convert than into a row in the aggregate file.', () => {
    const returnData = deforestationTrendsService.generateAggregate('table', 'list_name', {
      commodity_threat_deforestation: '{"2010": 1.2345, "2011": 5.4321}',
    });
    expect(returnData).toEqual([
      ['List Name', 'Loss (thousand ha)', 'Year'],
      ['list_name', '1.2345', '2010'],
      ['list_name', '5.4321', '2011'],
    ]);
  });

  test('Receive an empty object', () => {
    const returnData = deforestationTrendsService.generateAggregate('table', 'list_name', {});
    expect(returnData).toEqual([['List Name', 'Loss (thousand ha)', 'Year']]);
  });

  test('Receive an undefined data', () => {
    const returnData = deforestationTrendsService.generateAggregate(
      'table',
      'list_name',
      undefined
    );
    expect(returnData).toEqual([['List Name', 'Loss (thousand ha)', 'Year']]);
  });
});
