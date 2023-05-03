import { soyParser } from './soy.parser';

describe('Soy Parser', () => {
  test('Receive soy and return it', () => {
    const dataRow = [];
    const csvData = [];
    soyParser({
      dataRow,
      data: {},
      csvData,
    });
    expect(dataRow.length).toEqual(0);
    expect(csvData.length).toEqual(0);
  });

  test('Receive [total_area, soy_total_area, soy_pre2001_nonforest_area]  and return [ "100.00", 10, "60.00", 3 ]', () => {
    const dataRow = [];
    const csvData = [];
    soyParser({
      dataRow,
      data: {
        total_area: 5,
        soy_total_area: '{"2019": 1,"2020": 2,"2021": 3,"202": 4}',
        soy_pre2001_nonforest_area: 3,
      },
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['100.00', 10, '60.00', 3]);
  });

  test('Receive [total_area, soy_total_area]  and return ["100.00", 10, "0.00"]', () => {
    const dataRow = [];
    const csvData = [];
    soyParser({
      dataRow,
      data: {
        total_area: 5,
        soy_total_area: '{"2019": 1,"2020": 2,"2021": 3,"202": 4}',
      },
      csvData,
    });
    expect(csvData.length).toEqual(1);
    expect(csvData[0]).toEqual(['100.00', 10, '0.00']);
  });

  test('Receive [total_area, soy_pre2001_nonforest_area]  and return []', () => {
    const dataRow = [];
    const csvData = [];
    soyParser({
      dataRow,
      data: {
        total_area: 5,
        soy_pre2001_nonforest_area: 3,
      },
      csvData,
    });
    expect(csvData.length).toEqual(0);
  });
});
