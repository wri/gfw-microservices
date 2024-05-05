import { GetLatestValue } from './get.latest.value';

describe('GetLatestValue', () => {
  test('Should return undefined when list to filter de object is undefined', () => {
    const getLatestValue = new GetLatestValue(undefined);
    getLatestValue._transform(
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
    const getLatestValue = new GetLatestValue(['yearly']);
    getLatestValue._transform(undefined, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return the last value', () => {
    const getLatestValue = new GetLatestValue(['yearly']);
    getLatestValue._transform(
      {
        yearly: '{"2020": 1, "2021": 2, "2023": 3}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: 3 });
      }
    );
  });

  test('Should return the most recent value', () => {
    const getLatestValue = new GetLatestValue(['yearly']);
    getLatestValue._transform(
      {
        yearly: '{"2019": 0.25, "2020": 0, "2021": 0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: 0.25 });
      }
    );
  });

  test('Should return 0 when all values are 0', () => {
    const getLatestValue = new GetLatestValue(['yearly']);
    getLatestValue._transform(
      {
        yearly: '{"2019": 0, "2020": 0, "2021": 0}',
      },
      '',
      (err, data) => {
        expect(data).toEqual({ yearly: 0 });
      }
    );
  });
});
