import * as moment from 'moment';
import {
  getGladDaily,
  getGladMonthlyMonth,
  getGladMonthlyQuarter,
  getGladMonthlyYear,
  getViirsGrouped,
} from './alerts.parser';

describe('Alerts Parser', () => {
  test('Get Glad Daily', () => {
    const feature = {
      glad_alerts_daily: [
        { day: '2020-01-01' },
        { day: '2020-01-02' },
        { day: '2020-01-03' },
        { day: '2020-01-04' },
        { day: '2020-01-05' },
      ],
    };

    const momentStart = moment('2020-01-02');
    const momentEnd = moment('2020-01-04');

    const result = getGladDaily(feature, momentStart, momentEnd);
    expect(result).toStrictEqual([
      { day: '2020-01-02' },
      { day: '2020-01-03' },
      { day: '2020-01-04' },
    ]);
  });

  test('Get Glad Monthly', () => {
    const feature = {
      glad_alerts_monthly: [
        { day: '2020-01' },
        { day: '2020-02' },
        { day: '2020-03' },
        { day: '2020-04' },
        { day: '2020-05' },
      ],
    };

    const momentStart = moment('2020-02-01');
    const momentEnd = moment('2020-04-01');

    const result = getGladMonthlyMonth(feature, momentStart, momentEnd);
    expect(result).toStrictEqual([{ day: '2020-02' }, { day: '2020-03' }, { day: '2020-04' }]);
  });

  test('Get Glad Monthly Quarter', () => {
    const feature = {
      glad_alerts_monthly: [
        { day: '2020-01' },
        { day: '2020-02' },
        { day: '2020-03' },
        { day: '2020-04' },
        { day: '2020-05' },
      ],
    };

    const momentEnd = moment('2020-05-01');

    const result = getGladMonthlyQuarter(feature, momentEnd);
    expect(result).toStrictEqual([{ day: '2020-03' }, { day: '2020-04' }, { day: '2020-05' }]);
  });

  test('Get Glad Monthly Year', () => {
    const feature = {
      glad_alerts_monthly: [
        { day: '2018-12' },
        { day: '2019-01' },
        { day: '2019-02' },
        { day: '2019-03' },
        { day: '2019-04' },
        { day: '2019-05' },
        { day: '2019-06' },
        { day: '2019-07' },
        { day: '2019-08' },
        { day: '2019-09' },
        { day: '2019-10' },
        { day: '2019-11' },
        { day: '2019-12' },
        { day: '2020-01' },
        { day: '2020-02' },
        { day: '2020-03' },
        { day: '2020-04' },
        { day: '2020-05' },
      ],
    };

    const momentEnd = moment('2020-05-01');

    const result = getGladMonthlyYear(feature, momentEnd);
    expect(result).toStrictEqual([
      { day: '2019-05' },
      { day: '2019-06' },
      { day: '2019-07' },
      { day: '2019-08' },
      { day: '2019-09' },
      { day: '2019-10' },
      { day: '2019-11' },
      { day: '2019-12' },
      { day: '2020-01' },
      { day: '2020-02' },
      { day: '2020-03' },
      { day: '2020-04' },
      { day: '2020-05' },
    ]);
  });

  test('Get Viirs Grouped', () => {
    const feature = {
      viirs_alerts_daily: [
        { day: '2020-01-01' },
        { day: '2020-01-02' },
        { day: '2020-01-03' },
        { day: '2020-01-04' },
        { day: '2020-01-05' },
      ],
    };

    const momentStart = moment('2020-01-02');
    const momentEnd = moment('2020-01-04');

    const result = getViirsGrouped(feature, momentStart, momentEnd);
    expect(result).toStrictEqual({
      '2020-01-02': [{ day: '2020-01-02' }],
      '2020-01-03': [{ day: '2020-01-03' }],
      '2020-01-04': [{ day: '2020-01-04' }],
      delete: [{ day: '2020-01-01' }, { day: '2020-01-05' }],
    });
  });
});
