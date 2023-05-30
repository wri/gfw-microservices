import { dataLayerParser, brazilBiomesYearlyTCLParser } from './south.america.parser';

describe('Brazil Biomes Parser', () => {
  test('Receive empty and get an empty array', () => {
    const csvData = [];
    const dataRow = [];
    dataLayerParser({
      data: {},
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(0);
  });

  test('Receive [brazil_biomes] and get an array with [Amazônia, Cerrado]', () => {
    const csvData = [];
    const dataRow = [];
    dataLayerParser({
      data: {
        brazil_biomes: '{"Amazônia":785212.7094, "Cerrado": 235212.7094}',
      },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(2);
    expect(csvData).toEqual([
      ['Brazil Biomes', 'Amazônia', '76.95'],
      ['Brazil Biomes', 'Cerrado', '23.05'],
    ]);
  });
});

describe('Brazil Biomes Yearly TCL Parser', () => {
  test('Receive empty and get an empty array', () => {
    const csvData = [];
    const dataRow = [];
    brazilBiomesYearlyTCLParser({
      field: {
        label: 'teste',
      },
      yearlyData: {},
      totalStat: 10000,
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(0);
  });

  test('Pass input with totalStat and the result come with percent calculation', () => {
    const csvData = [];
    const dataRow = [];
    brazilBiomesYearlyTCLParser({
      field: {
        label: 'teste',
      },
      yearlyData: {
        Amazônia: {
          '2017': 18498.6177,
          '2018': 20815.6329,
          '2019': 9521.9357,
          '2020': 9326.9772,
          '2021': 7405.8949,
        },
        Cerrado: {
          '2017': 3819.6146,
          '2018': 15358.7243,
          '2019': 5940.0669,
          '2020': 8008.1741,
          '2021': 14105.0713,
        },
      },
      totalStat: 10000,
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(10);
    expect(csvData[0]).toEqual([
      'teste - Amazônia',
      18498.6177,
      '2017',
      65569.05840000001,
      '28.21',
    ]);
    expect(csvData[4]).toEqual(['teste - Amazônia', 7405.8949, '2021', 65569.05840000001, '11.29']);
    expect(csvData[9]).toEqual(['teste - Cerrado', 14105.0713, '2021', 47231.65119999999, '29.86']);
  });

  test('Pass input without totalStat and the result come without percent calculation', () => {
    const csvData = [];
    const dataRow = [];
    brazilBiomesYearlyTCLParser({
      field: {
        label: 'teste',
      },
      yearlyData: {
        Amazônia: {
          '2017': 18498.6177,
          '2018': 20815.6329,
          '2019': 9521.9357,
          '2020': 9326.9772,
          '2021': 7405.8949,
        },
        Cerrado: {
          '2017': 3819.6146,
          '2018': 15358.7243,
          '2019': 5940.0669,
          '2020': 8008.1741,
          '2021': 14105.0713,
        },
      },
      totalStat: undefined,
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(10);
    expect(csvData[0]).toEqual(['teste - Amazônia', 18498.6177, '2017']);
    expect(csvData[4]).toEqual(['teste - Amazônia', 7405.8949, '2021']);
    expect(csvData[9]).toEqual(['teste - Cerrado', 14105.0713, '2021']);
  });

  test('Pass input without label and did not break', () => {
    const csvData = [];
    const dataRow = [];
    brazilBiomesYearlyTCLParser({
      field: {},
      yearlyData: {
        Amazônia: {
          '2017': 18498.6177,
          '2018': 20815.6329,
          '2019': 9521.9357,
          '2020': 9326.9772,
          '2021': 7405.8949,
        },
        Cerrado: {
          '2017': 3819.6146,
          '2018': 15358.7243,
          '2019': 5940.0669,
          '2020': 8008.1741,
          '2021': 14105.0713,
        },
      },
      totalStat: undefined,
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(10);
    expect(csvData[0]).toEqual([' - Amazônia', 18498.6177, '2017']);
    expect(csvData[4]).toEqual([' - Amazônia', 7405.8949, '2021']);
    expect(csvData[9]).toEqual([' - Cerrado', 14105.0713, '2021']);
  });
});
