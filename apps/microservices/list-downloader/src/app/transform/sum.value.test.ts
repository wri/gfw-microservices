import { SumValue } from './sum.value';

describe('SumValue', () => {
  test('Should return undefined when list to filter de object is undefined', () => {
    const total = new SumValue(undefined);
    total._transform(
      {
        name: 'test',
        status: 'test',
        location_id: 1,
      },
      '',
      (err, data) => {
        expect(data).toEqual(undefined);
      }
    );
  });

  test('Should return undefined when receive undefined as data', () => {
    const total = new SumValue(['yearly']);
    total._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return the sum of all values', () => {
    const total = new SumValue(['yearly']);
    total._transform(
      {
        yearly: '{"2020": 1, "2021": 2}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: 3 });
      }
    );
  });

  test('Should return the sum of all values', () => {
    const total = new SumValue(['yearly']);
    total._transform(
      {
        yearly: '{"2019": 0.25, "2020": 0, "2021": 0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: 0.25 });
      }
    );
  });
});
