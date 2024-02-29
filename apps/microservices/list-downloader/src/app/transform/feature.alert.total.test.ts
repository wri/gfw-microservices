import { FeatureAlertTotal } from './feature.alert.total';

describe('FeatureAlertTotal', () => {
  test('Should return undefined when receive empty object', () => {
    const featureAlertTotal = new FeatureAlertTotal('gladTimeframe', 'Integrated');

    featureAlertTotal._transform(
      {
        listName: 'test',
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          listName: 'test',
          featureAlertTotal: 0,
        });
      }
    );
  });

  test('Aggregate fireTimeframe and organize data', () => {
    const featureAlertTotal = new FeatureAlertTotal('fireTimeframe', 'VIIRS');

    featureAlertTotal._transform(
      {
        listName: 'test',
        fireTimeframe: {
          '2023-02': [{ count: 2, day: '2023-02' }],
          '2023-03': [{ count: 2, day: '2023-03' }],
        },
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          featureAlertTotal: 4,
          fireTimeframe: {
            '2023-02': [
              {
                count: 2,
                day: '2023-02',
              },
            ],
            '2023-03': [
              {
                count: 2,
                day: '2023-03',
              },
            ],
          },
          listName: 'test',
        });
      }
    );
  });

  test('Aggregate gladTimeFrame and organize data', () => {
    const featureAlertTotal = new FeatureAlertTotal('gladTimeframe', 'Integrated');

    featureAlertTotal._transform(
      {
        listName: 'test',
        gladTimeframe: [
          { count: 11, day: '2023-02-01' },
          { count: 12, day: '2023-02-02' },
          { count: 13, day: '2023-02-03' },
        ],
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          featureAlertTotal: 36,
          gladTimeframe: [
            {
              count: 11,
              day: '2023-02-01',
            },
            {
              count: 12,
              day: '2023-02-02',
            },
            {
              count: 13,
              day: '2023-02-03',
            },
          ],
          listName: 'test',
        });
      }
    );
  });
});
