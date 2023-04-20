import { commodityMillPriorityLevelYearly } from './mill.priority.parser';

describe('Commodity Mill Priority Level Yearly', () => {
  test('Receive empty and get an empty array', () => {
    const dataRow = [];
    const csvData = [];
    commodityMillPriorityLevelYearly({
      field: {
        label: 'teste',
      },
      yearlyData: {},
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(0);
  });

  test('Receive { "2019": 1,"2020": 2,"2021": 3,"2022": 4} and data parsed to (low, medium, high)', () => {
    const dataRow = [];
    const csvData = [];
    commodityMillPriorityLevelYearly({
      field: {
        label: 'teste',
      },
      yearlyData: { '2019': 0, '2020': 1, '2021': 2, '2022': 3 },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual(['teste', 'Low', '2019']);
    expect(csvData[1]).toEqual(['teste', 'Medium', '2020']);
    expect(csvData[2]).toEqual(['teste', 'High', '2021']);
    expect(csvData[3]).toEqual(['teste', 'High', '2022']);
  });

  test('Receive { "2019": 1,"2020": 2,"2021": 3,"2022": 4} without field label and data parsed to (low, medium, high)', () => {
    const dataRow = [];
    const csvData = [];
    commodityMillPriorityLevelYearly({
      field: {},
      yearlyData: { '2019': 0, '2020': 1, '2021': 2, '2022': 3 },
      dataRow,
      csvData,
    });
    expect(csvData.length).toEqual(4);
    expect(csvData[0]).toEqual(['Low', '2019']);
    expect(csvData[1]).toEqual(['Medium', '2020']);
    expect(csvData[2]).toEqual(['High', '2021']);
    expect(csvData[3]).toEqual(['High', '2022']);
  });
});
