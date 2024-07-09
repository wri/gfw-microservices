import { FilterTimeframeIntegratedAlerts } from './filter.timeframe.integrated.alerts';

describe('FilterTimeframeIntegratedAlerts', () => {
  let filter: FilterTimeframeIntegratedAlerts;

  beforeEach(() => {
    filter = new FilterTimeframeIntegratedAlerts(
      ['column1', 'column2'],
      '2022-01-01',
      '2022-01-31'
    );
  });

  it('should filter data within the specified timeframe', () => {
    const input = {
      column1: '{"2022-01-01": 10, "2022-01-15": 20, "2022-02-01": 30}',
      column2: '{"2022-01-10": 15, "2022-01-20": 25, "2022-02-01": 35}',
    };

    const expectedOutput = {
      column1: '{"2022-01-01":10,"2022-01-15":20}',
      column2: '{"2022-01-10":15,"2022-01-20":25}',
    };

    const transformedData = filter.filterData(input);

    expect(transformedData).toEqual(expectedOutput);
  });

  it('should not modify data outside the specified timeframe', () => {
    const input = {
      column1: '{"2022-01-01": 10, "2022-01-30": 30}',
      column2: '{"2022-01-05": 12, "2022-01-10": 15, "2022-01-30": 35}',
    };

    const transformedData = filter.filterData(input);

    expect(transformedData).toEqual({
      column1: '{"2022-01-01":10,"2022-01-30":30}',
      column2: '{"2022-01-05":12,"2022-01-10":15,"2022-01-30":35}',
    });
  });
});
