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
    expect(csvData[0]).toEqual(['Tree Cover Loss', 12114.5364, '2018', 40736.9613, '29.74']);
    expect(csvData[1]).toEqual(['Tree Cover Loss', 10570.2785, '2019', 40736.9613, '25.95']);
    expect(csvData[2]).toEqual(['Tree Cover Loss', 8481.1971, '2020', 40736.9613, '20.82']);
    expect(csvData[3]).toEqual(['Tree Cover Loss', 9570.9493, '2021', 40736.9613, '23.49']);
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
        tree_cover_loss_total_yearly_total: '[12114.5364, 10570.2785, 8481.1971, 9570.9493]',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual(['Tree Cover Loss', 12114.5364, '2018', 40736.9613, '29.74']);
    expect(csvData[1]).toEqual(['Tree Cover Loss', 10570.2785, '2019', 40736.9613, '25.95']);
    expect(csvData[2]).toEqual(['Tree Cover Loss', 8481.1971, '2020', 40736.9613, '20.82']);
    expect(csvData[3]).toEqual(['Tree Cover Loss', 9570.9493, '2021', 40736.9613, '23.49']);
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
        tree_cover_loss_total_yearly: '{"2018":0,"2019":0,"2020":0,"2021":9570.9493}',
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

  test('When the all input data is zero', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        parsed: 'yearly',
        composites: [
          {
            attribute: 'commodity_threat_deforestation',
            label: 'trends',
            following: {
              attribute: 'commodity_threat_deforestation',
              parsed: 'total',
            },
          },
        ],
      },
      data: {
        commodity_threat_deforestation: '{"2018":0,"2019":0,"2020":0}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(3);
    expect(csvData[0]).toEqual(['trends', 0, '2018', 0, '0.00']);
    expect(csvData[1]).toEqual(['trends', 0, '2019', 0, '0.00']);
    expect(csvData[2]).toEqual(['trends', 0, '2020', 0, '0.00']);
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
    expect(csvData[0]).toEqual(['Tree Cover Loss', 12114.5364, '2018', 81473.92259999999, '14.87']);
    expect(csvData[1]).toEqual(['Tree Cover Loss', 10570.2785, '2019', 81473.92259999999, '12.97']);
    expect(csvData[2]).toEqual(['Tree Cover Loss', 8481.1971, '2020', 81473.92259999999, '10.41']);
    expect(csvData[3]).toEqual(['Tree Cover Loss', 9570.9493, '2021', 81473.92259999999, '11.75']);
  });

  test('Parse attribute commodity_mill_priority_level.', () => {
    const dataRow = [];
    const csvData = [];
    yearlyParser({
      operation: {
        composites: [{ attribute: 'commodity_mill_priority_level', label: '' }],
      },
      data: {
        commodity_mill_priority_level: '{"2018": 0, "2019": 1, "2020": 2, "2021": 3}',
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
    expect(csvData[0]).toEqual(['Brazil Biomes - Amazônia', 37726.0064, '2018']);
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

  test('Uses country_specific_deforestation_wdpa_yearly.BRA when present (WDPA preference)', () => {
    const dataRow = [];
    const csvData = [];

    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_prodes_wdpa_yearly',
            label: 'Protected Areas',
          },
        ],
      },
      data: {
        country_specific_deforestation_wdpa_yearly: JSON.stringify({ BRA: { 2018: 10, 2019: 20 } }),
        // Should be ignored because BRA-specific WDPA data exists
        tree_cover_loss_prodes_wdpa_yearly: '{"2018": 999}',
      },
      dataRow,
      csvData,
    });

    // Should have 18 years (2008-2025) with only 2018 and 2019 having data
    expect(csvData.length).toEqual(18);
    expect(csvData.find((row) => row[2] === '2018')).toEqual(['Protected Areas', 10, '2018']);
    expect(csvData.find((row) => row[2] === '2019')).toEqual(['Protected Areas', 20, '2019']);
    // Check some years are filled with 0
    expect(csvData.find((row) => row[2] === '2008')).toEqual(['Protected Areas', 0, '2008']);
    expect(csvData.find((row) => row[2] === '2025')).toEqual(['Protected Areas', 0, '2025']);
  });

  test('Falls back to tree_cover_loss_prodes_wdpa_yearly when BRA-specific WDPA is absent', () => {
    const dataRow = [];
    const csvData = [];

    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_prodes_wdpa_yearly',
            label: 'Protected Areas',
          },
        ],
      },
      data: {
        // No BRA key provided -> should use legacy attribute
        country_specific_deforestation_wdpa_yearly: '{}',
        tree_cover_loss_prodes_wdpa_yearly: '{"2018": 5, "2019": 6}',
      },
      dataRow,
      csvData,
    });

    // Should have 18 years (2008-2025) with only 2018 and 2019 having data
    expect(csvData.length).toEqual(18);
    expect(csvData.find((row) => row[2] === '2018')).toEqual(['Protected Areas', 5, '2018']);
    expect(csvData.find((row) => row[2] === '2019')).toEqual(['Protected Areas', 6, '2019']);
    // Check some years are filled with 0
    expect(csvData.find((row) => row[2] === '2010')).toEqual(['Protected Areas', 0, '2010']);
    expect(csvData.find((row) => row[2] === '2024')).toEqual(['Protected Areas', 0, '2024']);
  });

  test('PRODES data filters years outside the PRODES date range (2008-2025) and fills missing years with 0', () => {
    const dataRow = [];
    const csvData = [];

    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_prodes_yearly',
            label: 'PRODES',
          },
        ],
      },
      data: {
        tree_cover_loss_prodes_yearly: JSON.stringify({
          2007: 100, // Should be filtered out (before start year 2008)
          2008: 50,
          2009: 60,
          // 2010-2022 missing - should be filled with 0
          2023: 70,
          // 2024 missing - should be filled with 0
          2025: 80,
          2026: 90, // Should be filtered out (after end year 2025)
        }),
      },
      dataRow,
      csvData,
    });

    // Should have all years from 2008 to 2025 (18 years)
    expect(csvData.length).toBe(18);

    // Check year 2007 was filtered out
    expect(csvData.find((row) => row[2] === '2007')).toBeUndefined();

    // Check year 2008 is present
    expect(csvData.find((row) => row[2] === '2008')).toEqual(['PRODES', 50, '2008']);

    // Check missing year 2010 was filled with 0
    expect(csvData.find((row) => row[2] === '2010')).toEqual(['PRODES', 0, '2010']);

    // Check missing year 2024 was filled with 0
    expect(csvData.find((row) => row[2] === '2024')).toEqual(['PRODES', 0, '2024']);

    // Check year 2025 is present
    expect(csvData.find((row) => row[2] === '2025')).toEqual(['PRODES', 80, '2025']);

    // Check year 2026 was filtered out
    expect(csvData.find((row) => row[2] === '2026')).toBeUndefined();
  });

  test('PRODES WDPA data filters years outside the PRODES date range and fills missing years with 0', () => {
    const dataRow = [];
    const csvData = [];

    yearlyParser({
      operation: {
        composites: [
          {
            attribute: 'tree_cover_loss_prodes_wdpa_yearly',
            label: 'Protected Areas',
          },
        ],
      },
      data: {
        tree_cover_loss_prodes_wdpa_yearly: JSON.stringify({
          2007: 40, // Should be filtered out
          2008: 30,
          2015: 35,
          2025: 45,
          2026: 50, // Should be filtered out
        }),
      },
      dataRow,
      csvData,
    });

    // Should have all years from 2008 to 2025 (18 years)
    expect(csvData.length).toBe(18);

    // Check years are within range
    expect(csvData.find((row) => row[2] === '2007')).toBeUndefined();
    expect(csvData.find((row) => row[2] === '2008')).toEqual(['Protected Areas', 30, '2008']);
    expect(csvData.find((row) => row[2] === '2009')).toEqual(['Protected Areas', 0, '2009']); // Filled with 0
    expect(csvData.find((row) => row[2] === '2015')).toEqual(['Protected Areas', 35, '2015']);
    expect(csvData.find((row) => row[2] === '2025')).toEqual(['Protected Areas', 45, '2025']);
    expect(csvData.find((row) => row[2] === '2026')).toBeUndefined();
  });
});
