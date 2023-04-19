import { yearlyParser } from './yearly.parser';

describe('Yearly Parser.', () => {
  test('Receive empty and get an empty array', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
            following: {
              attribute: 'tree_cover_loss_total_yearly',
              parsed: 'total',
            },
          },
        ],
      },
      data: {},
      dataRow,
      csvData,
    });
    expect(csvData).toEqual([]);
  });

  test('Receive tree_cover_loss_total_yearly totalize it and calculate percent.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
            following: {
              attribute: 'tree_cover_loss_total_yearly',
              parsed: 'total',
            },
          },
        ],
      },
      data: {
        tree_cover_loss_total_yearly:
          '{"2018":12114.5364,"2019":10570.2785,"2020":8481.1971,"2021":9570.9493}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual([
      'Tree Cover Loss',
      12114.5364,
      '2018',
      40736.9613,
      '29.74',
    ]);
    expect(csvData[1]).toEqual([
      'Tree Cover Loss',
      10570.2785,
      '2019',
      40736.9613,
      '25.95',
    ]);
    expect(csvData[2]).toEqual([
      'Tree Cover Loss',
      8481.1971,
      '2020',
      40736.9613,
      '20.82',
    ]);
    expect(csvData[3]).toEqual([
      'Tree Cover Loss',
      9570.9493,
      '2021',
      40736.9613,
      '23.49',
    ]);
  });

  test('Totalize a field that is an array of numbers.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
            following: {
              attribute: 'tree_cover_loss_total_yearly_total',
              parsed: 'total',
            },
          },
        ],
      },
      data: {
        tree_cover_loss_total_yearly:
          '{"2018":12114.5364,"2019":10570.2785,"2020":8481.1971,"2021":9570.9493}',
        tree_cover_loss_total_yearly_total:
          '[12114.5364, 10570.2785, 8481.1971, 9570.9493]',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual([
      'Tree Cover Loss',
      12114.5364,
      '2018',
      40736.9613,
      '29.74',
    ]);
    expect(csvData[1]).toEqual([
      'Tree Cover Loss',
      10570.2785,
      '2019',
      40736.9613,
      '25.95',
    ]);
    expect(csvData[2]).toEqual([
      'Tree Cover Loss',
      8481.1971,
      '2020',
      40736.9613,
      '20.82',
    ]);
    expect(csvData[3]).toEqual([
      'Tree Cover Loss',
      9570.9493,
      '2021',
      40736.9613,
      '23.49',
    ]);
  });

  test('When the some input data is zero we should append it to the array.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
          },
        ],
      },
      data: {
        tree_cover_loss_total_yearly:
          '{"2018":0,"2019":0,"2020":0,"2021":9570.9493}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual(['Tree Cover Loss', 0, '2018']);
    expect(csvData[1]).toEqual(['Tree Cover Loss', 0, '2019']);
    expect(csvData[2]).toEqual(['Tree Cover Loss', 0, '2020']);
    expect(csvData[3]).toEqual(['Tree Cover Loss', 9570.9493, '2021']);
  });

  test('Totalize a field that is a object inside another object.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_total_yearly',
            label: 'Tree Cover Loss',
            following: {
              attribute: 'tree_cover_loss_total_yearly_total',
              parsed: 'total',
            },
          },
        ],
      },
      data: {
        tree_cover_loss_total_yearly:
          '{"2018":12114.5364,"2019":10570.2785,"2020":8481.1971,"2021":9570.9493}',
        tree_cover_loss_total_yearly_total:
          '{"area1": {"2018":6114.5364,"2019":5570.2785,"2020":4481.1971,"2021":5570.9493}, "area2": {"2018":6000,"2019":5000,"2020":4000,"2021":4000}}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual([
      'Tree Cover Loss',
      12114.5364,
      '2018',
      81473.92259999999,
      '14.87',
    ]);
    expect(csvData[1]).toEqual([
      'Tree Cover Loss',
      10570.2785,
      '2019',
      81473.92259999999,
      '12.97',
    ]);
    expect(csvData[2]).toEqual([
      'Tree Cover Loss',
      8481.1971,
      '2020',
      81473.92259999999,
      '10.41',
    ]);
    expect(csvData[3]).toEqual([
      'Tree Cover Loss',
      9570.9493,
      '2021',
      81473.92259999999,
      '11.75',
    ]);
  });

  test('Parse attribute commodity_mill_priority_level.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [{ attribute: 'commodity_mill_priority_level', label: '' }],
      },
      data: {
        commodity_mill_priority_level:
          '{"2018": 0, "2019": 1, "2020": 2, "2021": 3}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual(['Low', '2018']);
    expect(csvData[1]).toEqual(['Medium', '2019']);
    expect(csvData[2]).toEqual(['High', '2020']);
    expect(csvData[3]).toEqual(['High', '2021']);
  });

  test('Parse attribute tree_cover_loss_brazil_biomes_yearly for this case we also need that the data Country should be Brazil.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_brazil_biomes_yearly',
            label: 'Brazil Biomes',
          },
        ],
      },
      data: {
        tree_cover_loss_brazil_biomes_yearly:
          '{"Amazônia":{"2018":37726.0064,"2019":7939.4091,"2020":8115.7826,"2021":9165.8674}}',
        Country: 'Brazil',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual([
      'Brazil Biomes - Amazônia',
      37726.0064,
      '2018',
    ]);
    expect(csvData[1]).toEqual(['Brazil Biomes - Amazônia', 7939.4091, '2019']);
    expect(csvData[2]).toEqual(['Brazil Biomes - Amazônia', 8115.7826, '2020']);
    expect(csvData[3]).toEqual(['Brazil Biomes - Amazônia', 9165.8674, '2021']);
  });

  test('Parse data when it has category inside.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss',
            label: 'With Category',
          },
        ],
      },
      data: {
        tree_cover_loss:
          '{"cat1":{"2018":37726.0064,"2019":7939.4091,"2020":8115.7826,"2021":9165.8674},"cat2":{"2018":17726.0064,"2019":1939.4091,"2020":1115.7826,"2021":1165.8674}}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(8);
    expect(csvData[0]).toEqual(['With Category - cat1', 37726.0064, '2018']);
    expect(csvData[3]).toEqual(['With Category - cat1', 9165.8674, '2021']);
    expect(csvData[5]).toEqual(['With Category - cat2', 1939.4091, '2019']);
    expect(csvData[7]).toEqual(['With Category - cat2', 1165.8674, '2021']);
  });
});
