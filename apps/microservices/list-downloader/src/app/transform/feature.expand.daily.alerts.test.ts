import { FeatureExpandDailyAlerts } from './feature.expand.daily.alerts';

describe('Feature Alert Total Greater Than Zero', () => {
  test('Should return undefined when receive empty object', () => {
    const featureExpandDailyAlerts = new FeatureExpandDailyAlerts('Integrated');

    featureExpandDailyAlerts._transform(
      {
        listName: 'test',
      },
      '',
      (err, data) => {
        expect(data).toEqual([]);
      }
    );
  });

  test('Should expand viirs data', () => {
    const featureExpandDailyAlerts = new FeatureExpandDailyAlerts('VIIRS');

    featureExpandDailyAlerts._transform(
      {
        listName: 'test',
        fireTimeframe: {
          '2023-02-1': [{ count: 2, day: '2023-02-1' }],
        },
      },
      '',
      (err, data) => {
        expect(data).toStrictEqual([
          {
            count: 2,
            date: '2023-02-1',
            listName: 'test',
            fireTimeframe: {
              '2023-02-1': [{ count: 2, day: '2023-02-1' }],
            },
          },
        ]);
      }
    );
  });

  test('Should expandd glad data', () => {
    const featureExpandDailyAlerts = new FeatureExpandDailyAlerts('Integrated');

    featureExpandDailyAlerts._transform(
      {
        listName: 'test',
        gladTimeframe: [{ count: 11, day: '2023-02-01' }],
      },
      '',
      (err, data) => {
        expect(data).toEqual([
          {
            count: 11,
            date: '2023-02-01',
            gladTimeframe: [
              {
                count: 11,
                day: '2023-02-01',
              },
            ],
            listName: 'test',
          },
        ]);
      }
    );
  });

  test('Should work when fireTimeframe is empty', () => {
    const featureExpandDailyAlerts = new FeatureExpandDailyAlerts('VIIRS');

    featureExpandDailyAlerts._transform(
      {
        listName: 'test',
        fireTimeframe: {},
      },
      '',
      (err, data) => {
        expect(data).toStrictEqual([]);
      }
    );
  });

  test('Should work when gladTimeframe is empty', () => {
    const featureExpandDailyAlerts = new FeatureExpandDailyAlerts('Integrated');

    featureExpandDailyAlerts._transform(
      {
        listName: 'test',
        gladTimeframe: [],
      },
      '',
      (err, data) => {
        expect(data).toEqual([]);
      }
    );
  });
});
