import { ApplyTimeframeFilter } from './apply.timeframe.filter';

describe('ApplyTimeframeFilter', () => {
  test('Receive empty object and return undefined', () => {
    const applyTimeframeFilter = new ApplyTimeframeFilter(
      'WEEK',
      'GLAD',
      '2023-02-01',
      '2023-04-01'
    );
    applyTimeframeFilter._transform(
      {
        'Sub State': '',
        Country: '',
        State: '',
        gadm_id: '',
        gadmid: '',
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gladAlerts: false,
        glad_alerts_daily: [],
        glad_alerts_monthly: [],
        glad_alerts_weekly: [],
        list_id: 0,
        location_id: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
        name_all: '',
        tree_cover_extent_total: 0,
        viirs_alerts_daily: [],
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          Country: '',
          State: '',
          'Sub State': '',
          fireTimeframe: {},
          gadm_id: '',
          gadmid: '',
          gadmid_0: '',
          gadmid_0_lat: 0,
          gadmid_0_lon: 0,
          gadmid_1: '',
          gadmid_1_lat: 0,
          gadmid_1_lon: 0,
          gadmid_2: '',
          gadmid_2_lat: 0,
          gadmid_2_lon: 0,
          gladAlerts: false,
          gladTimeframe: [],
          glad_alerts_daily: [],
          glad_alerts_monthly: [],
          glad_alerts_weekly: [],
          list_id: 0,
          location_id: 0,
          location_lat: 0,
          location_lon: 0,
          location_name: '',
          name_all: '',
          tree_cover_extent_total: 0,
          viirs_alerts_daily: [],
        });
      }
    );
  });

  test('Add field glad timeframe on a Week base', () => {
    const applyTimeframeFilter = new ApplyTimeframeFilter(
      'WEEK',
      'GLAD',
      '2023-02-01',
      '2023-02-03'
    );
    applyTimeframeFilter._transform(
      {
        'Sub State': '',
        Country: '',
        State: '',
        gadm_id: '',
        gadmid: '',
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gladAlerts: undefined,
        glad_alerts_monthly: undefined,
        glad_alerts_weekly: undefined,
        list_id: 0,
        location_id: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
        name_all: '',
        tree_cover_extent_total: 0,
        glad_alerts_daily: [
          { count: 10, day: '2023-01-30' },
          { count: 11, day: '2023-02-01' },
          { count: 12, day: '2023-02-02' },
          { count: 13, day: '2023-02-03' },
          { count: 14, day: '2023-02-04' },
          { count: 15, day: '2023-02-05' },
        ],
        viirs_alerts_daily: [{ count: 2, day: '2023-11-20' }],
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          Country: '',
          State: '',
          'Sub State': '',
          fireTimeframe: {},
          gadm_id: '',
          gadmid: '',
          gadmid_0: '',
          gadmid_0_lat: 0,
          gadmid_0_lon: 0,
          gadmid_1: '',
          gadmid_1_lat: 0,
          gadmid_1_lon: 0,
          gadmid_2: '',
          gadmid_2_lat: 0,
          gadmid_2_lon: 0,
          gladAlerts: undefined,
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
          glad_alerts_daily: [
            {
              count: 10,
              day: '2023-01-30',
            },
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
            {
              count: 14,
              day: '2023-02-04',
            },
            {
              count: 15,
              day: '2023-02-05',
            },
          ],
          glad_alerts_monthly: undefined,
          glad_alerts_weekly: undefined,
          list_id: 0,
          location_id: 0,
          location_lat: 0,
          location_lon: 0,
          location_name: '',
          name_all: '',
          tree_cover_extent_total: 0,
          viirs_alerts_daily: [
            {
              count: 2,
              day: '2023-11-20',
            },
          ],
        });
      }
    );
  });

  test('Add field glad timeframe on a Month base', () => {
    const applyTimeframeFilter = new ApplyTimeframeFilter(
      'MONTH',
      'GLAD',
      '2023-02-01',
      '2023-03-31'
    );
    applyTimeframeFilter._transform(
      {
        'Sub State': '',
        Country: '',
        State: '',
        gadm_id: '',
        gadmid: '',
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gladAlerts: undefined,
        glad_alerts_daily: undefined,
        glad_alerts_weekly: undefined,
        list_id: 0,
        location_id: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
        name_all: '',
        tree_cover_extent_total: 0,
        glad_alerts_monthly: [
          { count: 10, day: '2023-01' },
          { count: 11, day: '2023-02' },
          { count: 12, day: '2023-03' },
          { count: 13, day: '2023-04' },
          { count: 14, day: '2023-05' },
          { count: 15, day: '2023-06' },
        ],
        viirs_alerts_daily: [
          { count: 2, day: '2023-01' },
          { count: 2, day: '2023-02' },
          { count: 2, day: '2023-03' },
          { count: 2, day: '2023-04' },
        ],
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          Country: '',
          State: '',
          'Sub State': '',
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
          gadm_id: '',
          gadmid: '',
          gadmid_0: '',
          gadmid_0_lat: 0,
          gadmid_0_lon: 0,
          gadmid_1: '',
          gadmid_1_lat: 0,
          gadmid_1_lon: 0,
          gadmid_2: '',
          gadmid_2_lat: 0,
          gadmid_2_lon: 0,
          gladAlerts: undefined,
          gladTimeframe: [
            {
              count: 11,
              day: '2023-02',
            },
            {
              count: 12,
              day: '2023-03',
            },
          ],
          glad_alerts_daily: undefined,
          glad_alerts_monthly: [
            {
              count: 10,
              day: '2023-01',
            },
            {
              count: 11,
              day: '2023-02',
            },
            {
              count: 12,
              day: '2023-03',
            },
            {
              count: 13,
              day: '2023-04',
            },
            {
              count: 14,
              day: '2023-05',
            },
            {
              count: 15,
              day: '2023-06',
            },
          ],
          glad_alerts_weekly: undefined,
          list_id: 0,
          location_id: 0,
          location_lat: 0,
          location_lon: 0,
          location_name: '',
          name_all: '',
          tree_cover_extent_total: 0,
          viirs_alerts_daily: [
            {
              count: 2,
              day: '2023-01',
            },
            {
              count: 2,
              day: '2023-02',
            },
            {
              count: 2,
              day: '2023-03',
            },
            {
              count: 2,
              day: '2023-04',
            },
          ],
        });
      }
    );
  });

  test('Add field glad timeframe on a Quarter base', () => {
    const applyTimeframeFilter = new ApplyTimeframeFilter(
      'QUARTER',
      'GLAD',
      '2023-02-01',
      '2023-03-31'
    );
    applyTimeframeFilter._transform(
      {
        'Sub State': '',
        Country: '',
        State: '',
        gadm_id: '',
        gadmid: '',
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gladAlerts: undefined,
        glad_alerts_daily: undefined,
        glad_alerts_weekly: undefined,
        list_id: 0,
        location_id: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
        name_all: '',
        tree_cover_extent_total: 0,
        glad_alerts_monthly: [
          { count: 10, day: '2023-01' },
          { count: 11, day: '2023-02' },
          { count: 12, day: '2023-03' },
          { count: 13, day: '2023-04' },
          { count: 14, day: '2023-05' },
          { count: 15, day: '2023-06' },
        ],
        viirs_alerts_daily: [
          { count: 2, day: '2023-01' },
          { count: 2, day: '2023-02' },
          { count: 2, day: '2023-03' },
          { count: 2, day: '2023-04' },
        ],
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          Country: '',
          State: '',
          'Sub State': '',
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
          gadm_id: '',
          gadmid: '',
          gadmid_0: '',
          gadmid_0_lat: 0,
          gadmid_0_lon: 0,
          gadmid_1: '',
          gadmid_1_lat: 0,
          gadmid_1_lon: 0,
          gadmid_2: '',
          gadmid_2_lat: 0,
          gadmid_2_lon: 0,
          gladAlerts: undefined,
          gladTimeframe: [
            {
              count: 10,
              day: '2023-01',
            },
            {
              count: 11,
              day: '2023-02',
            },
            {
              count: 12,
              day: '2023-03',
            },
          ],
          glad_alerts_daily: undefined,
          glad_alerts_monthly: [
            {
              count: 10,
              day: '2023-01',
            },
            {
              count: 11,
              day: '2023-02',
            },
            {
              count: 12,
              day: '2023-03',
            },
            {
              count: 13,
              day: '2023-04',
            },
            {
              count: 14,
              day: '2023-05',
            },
            {
              count: 15,
              day: '2023-06',
            },
          ],
          glad_alerts_weekly: undefined,
          list_id: 0,
          location_id: 0,
          location_lat: 0,
          location_lon: 0,
          location_name: '',
          name_all: '',
          tree_cover_extent_total: 0,
          viirs_alerts_daily: [
            {
              count: 2,
              day: '2023-01',
            },
            {
              count: 2,
              day: '2023-02',
            },
            {
              count: 2,
              day: '2023-03',
            },
            {
              count: 2,
              day: '2023-04',
            },
          ],
        });
      }
    );
  });

  test('Add field glad timeframe on a Year base', () => {
    const applyTimeframeFilter = new ApplyTimeframeFilter(
      'YEAR',
      'GLAD',
      '2023-02-01',
      '2023-03-31'
    );
    applyTimeframeFilter._transform(
      {
        'Sub State': '',
        Country: '',
        State: '',
        gadm_id: '',
        gadmid: '',
        gadmid_0: '',
        gadmid_0_lat: 0,
        gadmid_0_lon: 0,
        gadmid_1: '',
        gadmid_1_lat: 0,
        gadmid_1_lon: 0,
        gadmid_2: '',
        gadmid_2_lat: 0,
        gadmid_2_lon: 0,
        gladAlerts: undefined,
        glad_alerts_daily: undefined,
        glad_alerts_weekly: undefined,
        list_id: 0,
        location_id: 0,
        location_lat: 0,
        location_lon: 0,
        location_name: '',
        name_all: '',
        tree_cover_extent_total: 0,
        glad_alerts_monthly: [
          { count: 9, day: '2022-02' },
          { count: 10, day: '2023-01' },
          { count: 11, day: '2023-02' },
          { count: 12, day: '2023-03' },
          { count: 13, day: '2023-04' },
          { count: 14, day: '2023-05' },
          { count: 15, day: '2023-06' },
        ],
        viirs_alerts_daily: [
          { count: 2, day: '2023-01' },
          { count: 2, day: '2023-02' },
          { count: 2, day: '2023-03' },
          { count: 2, day: '2023-04' },
        ],
      },
      '',
      (err, data) => {
        expect(data).toEqual({
          Country: '',
          State: '',
          'Sub State': '',
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
          gadm_id: '',
          gadmid: '',
          gadmid_0: '',
          gadmid_0_lat: 0,
          gadmid_0_lon: 0,
          gadmid_1: '',
          gadmid_1_lat: 0,
          gadmid_1_lon: 0,
          gadmid_2: '',
          gadmid_2_lat: 0,
          gadmid_2_lon: 0,
          gladAlerts: undefined,
          gladTimeframe: [
            {
              count: 10,
              day: '2023-01',
            },
            {
              count: 11,
              day: '2023-02',
            },
            {
              count: 12,
              day: '2023-03',
            },
          ],
          glad_alerts_daily: undefined,
          glad_alerts_monthly: [
            {
              count: 9,
              day: '2022-02',
            },
            {
              count: 10,
              day: '2023-01',
            },
            {
              count: 11,
              day: '2023-02',
            },
            {
              count: 12,
              day: '2023-03',
            },
            {
              count: 13,
              day: '2023-04',
            },
            {
              count: 14,
              day: '2023-05',
            },
            {
              count: 15,
              day: '2023-06',
            },
          ],
          glad_alerts_weekly: undefined,
          list_id: 0,
          location_id: 0,
          location_lat: 0,
          location_lon: 0,
          location_name: '',
          name_all: '',
          tree_cover_extent_total: 0,
          viirs_alerts_daily: [
            {
              count: 2,
              day: '2023-01',
            },
            {
              count: 2,
              day: '2023-02',
            },
            {
              count: 2,
              day: '2023-03',
            },
            {
              count: 2,
              day: '2023-04',
            },
          ],
        });
      }
    );
  });
});
