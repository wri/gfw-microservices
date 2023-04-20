import { southEastAsiaOverlapParser } from './south.east.asia.parser';

describe('South East Asia Overlap Parser', () => {
  test('Receive an empty input and return an empty  array', () => {
    const dataRow = [];
    const csvData = [];
    southEastAsiaOverlapParser({
      operation: {
        parsed: 'yearly',
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
          },
        ],
      },
      listLevelAnalysis: {},
      data: {},
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(0);
  });

  test('Receive a Tree Cover Lost from Data and Analysis and return an array with a length of 21.', () => {
    const dataRow = [];
    const csvData = [];
    southEastAsiaOverlapParser({
      operation: {
        parsed: 'yearly',
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
          },
        ],
      },
      listLevelAnalysis: {
        tree_cover_loss_total_yearly:
          '{"2001":6227.2271,"2002":7317.5972,"2003":4950.8626,"2004":13510.5595,"2005":9957.4381,"2006":20201.6906,"2007":19292.1402,"2008":21495.652,"2009":22353.4759,"2010":12770.2286,"2011":16791.3762,"2012":55822.743,"2013":11550.4187,"2014":17168.1923,"2015":17749.0827,"2016":17120.1705,"2017":10351.1926,"2018":16968.1581,"2019":10441.7168,"2020":10995.9826,"2021":6881.2176}',
      },
      data: {
        tree_cover_loss_total_yearly:
          '{"2001":2227.2271,"2002":2317.5972,"2003":2950.8626,"2004":3510.5595,"2005":2957.4381,"2006":10201.6906,"2007":9292.1402,"2008":1495.652,"2009":12353.4759,"2010":2770.2286,"2011":6791.3762,"2012":25822.743,"2013":8550.4187,"2014":9168.1923,"2015":9749.0827,"2016":9120.1705,"2017":9351.1926,"2018":12968.1581,"2019":9441.7168,"2020":8995.9826,"2021":4881.2176}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(21);
    expect(csvData[0]).toEqual(['Tree Cover Loss', '2001', '1.35']);
    expect(csvData[10]).toEqual(['Tree Cover Loss', '2011', '4.12']);
    expect(csvData[20]).toEqual(['Tree Cover Loss', '2021', '2.96']);
  });

  test('Receive a Tree Cover Lost from Data and Analysis and return an array with a length of 21.', () => {
    const dataRow = [];
    const csvData = [];
    southEastAsiaOverlapParser({
      operation: {
        parsed: 'yearly',
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
          },
        ],
      },
      listLevelAnalysis: {
        tree_cover_loss_total_yearly: '3000',
      },
      data: {
        tree_cover_loss_total_yearly: '2000',
        total_area: '13000',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(2);
    expect(csvData[0]).toEqual([
      'Tree Cover Loss',
      'Within Forest Moratorium',
      '15.38',
    ]);
    expect(csvData[1]).toEqual([
      'Tree Cover Loss',
      'Outside Forest Moratorium',
      '84.62',
    ]);
  });
});
