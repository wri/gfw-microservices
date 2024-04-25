import {
  locationNameParser,
  listNameParser,
  pieChartParser,
  accumulateYearlyParser,
} from './shared.parser';

describe('Location Name Parser', () => {
  test('Receive investment name and return it', () => {
    const dataRow = [];
    locationNameParser({
      data: {
        'Investment Name': 'Investment Name',
      },
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual('Investment Name');
  });

  test('Receive multiple investment name and return it', () => {
    const dataRow = [];
    locationNameParser({
      data: {
        'Investment Name': 'IVN1,IVN2,IVN3',
      },
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual('"IVN1,IVN2,IVN3"');
  });

  test('Receive location name and return it', () => {
    const dataRow = [];
    locationNameParser({
      data: {
        'Location Name': 'Location Name',
      },
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual('Location Name');
  });

  test('Receive multiple location name and return it', () => {
    const dataRow = [];
    locationNameParser({
      data: {
        'Location Name': 'LCN1,LCN2,LCN3',
      },
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual('"LCN1,LCN2,LCN3"');
  });

  test('Receive Investment Name and Location Name and return Investment Name', () => {
    const dataRow = [];
    locationNameParser({
      data: {
        'Investment Name': 'Investment Name',
        'Location Name': 'Location Name',
      },
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual('Investment Name');
  });

  test('Receive empty and get an empty array', () => {
    const dataRow = [];
    locationNameParser({
      data: {},
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual(undefined);
  });
});

describe('List Name Parser', () => {
  test('Receive empty and get an empty array', () => {
    const dataRow = [];
    listNameParser({
      data: {},
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual('');
  });

  test('Receive a list name and return it', () => {
    const dataRow = [];
    listNameParser({
      data: { list_name: 'List Name' },
      dataRow,
    });
    const [value] = dataRow;
    expect(value).toEqual('List Name');
  });
});

describe('Accumulate Yearly Parser', () => {
  test('Receive empty and get an empty array', () => {
    const total = accumulateYearlyParser({ data: {} }, 'year');
    expect(total).toEqual(0);
  });

  test('Receive array [{"result":1},{"result":2},{"result":4}] and get 7', () => {
    const total = accumulateYearlyParser(
      { year: '[{"result":1},{"result":2},{"result":4}]' },
      'year'
    );
    expect(total).toEqual(7);
  });

  test('Receive array { year: "14"}  and get 14', () => {
    const total = accumulateYearlyParser({ year: '14' }, 'year');
    expect(total).toEqual(14);
  });

  test('Receive array [{"result":1},{"result":2},{"result":4}] and get 7', () => {
    const total = accumulateYearlyParser(
      { year: '[{"result":1},{"result":2},{"result":4}]' },
      'year'
    );
    expect(total).toEqual(7);
  });

  test('Receive array {"2019": 1,"2020": 2,"2021": 3,"2022": 4,"2023": 5} and get 10', () => {
    const total = accumulateYearlyParser(
      { year: '{"2019": 1,"2020": 2,"2021": 3,"2022": 4,"2023": 5}' },
      'year'
    );
    expect(total).toEqual(15);
  });
});

describe('Pie Chart Parser', () => {
  test('Receive empty and get an empty array', () => {
    const dataRow = [];
    const csvData = [];
    pieChartParser({
      operation: {
        name: 'pie_chart',
        parsed: 'overhead',
        composites: [],
        following: [],
      },
      dataRow,
      data: {},
      csvData,
    });
    expect(dataRow.length).toEqual(0);
    expect(csvData.length).toEqual(0);
  });

  test('Receive Two Category and Return Summary for that', () => {
    const dataRow = [];
    const csvData = [];
    pieChartParser({
      operation: {
        name: 'pie_chart',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'tree_cover_loss',
            label: 'Land Cover Southeast Asia',
          },
        ],
      },
      dataRow,
      data: {
        tree_cover_loss:
          '{"cat1": {"2019": 1,"2020": 2,"2021": 3,"2022": 4,"2023": 5}, "cat2": {"2019": 2,"2020": 3,"2021": 4,"2022": 5}}',
      },
      csvData,
    });
    expect(csvData.length).toEqual(2);
    expect(csvData[0]).toEqual(['Land Cover Southeast Asia', 'cat1', '51.72']);
    expect(csvData[1]).toEqual(['Land Cover Southeast Asia', 'cat2', '48.28']);
  });

  test('Receive 1 Category without label and Return Summary for that', () => {
    const dataRow = [];
    const csvData = [];
    pieChartParser({
      operation: {
        name: 'pie_chart',
        parsed: 'overhead',
        composites: [
          {
            attribute: 'tree_cover_loss',
          },
        ],
      },
      dataRow,
      data: {
        tree_cover_loss: '{"cat1": {"2019": 1,"2020": 2,"2021": 3,"2022": 4}}',
      },
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['', 'cat1', '100.00']);
  });
});
