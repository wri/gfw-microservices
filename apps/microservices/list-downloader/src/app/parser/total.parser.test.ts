import { totalParser } from './total.parser';

describe('Total Parser', () => {
  test('Receive empty and get an empty array', () => {
    const dataRow = [];
    totalParser({ operation: 'year', data: {}, dataRow });
    expect(dataRow).toEqual([0]);
  });

  test('Receive array [{"result":1},{"result":2},{"result":4}] and get 7', () => {
    const dataRow = [];
    totalParser({
      operation: { name: 'year' },
      data: { year: '[{"result":1},{"result":2},{"result":4}]' },
      dataRow,
    });
    expect(dataRow).toEqual([7]);
  });

  test('Receive array { year: "14"}  and get 14', () => {
    const dataRow = [];
    totalParser({ operation: { name: 'year' }, data: { year: '14' }, dataRow });
    expect(dataRow).toEqual([14]);
  });

  test('Receive array [{"result":1},{"result":2},{"result":4}] and get 7', () => {
    const dataRow = [];
    totalParser({
      operation: { name: 'year' },
      data: { year: '[{"result":1},{"result":2},{"result":4}]' },
      dataRow,
    });
    expect(dataRow).toEqual([7]);
  });

  test('Receive array {"2019": 1,"2020": 2,"2021": 3,"2022": 4} and get 10', () => {
    const dataRow = [];
    totalParser({
      operation: { name: 'year' },
      data: { year: '{"2019": 1,"2020": 2,"2021": 3,"2022": 4}' },
      dataRow,
    });
    expect(dataRow).toEqual([10]);
  });
});
