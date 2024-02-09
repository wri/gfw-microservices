import { AlertsFilterData } from './alerts.filter.data';
import { ALERTS_LOCATION_LEVEL } from '../shared/constants';

describe('AlertsFilterData', () => {
  test('receiving an empty object and return undefined', () => {
    const alertsFilterData = new AlertsFilterData(
      'GLAD',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test'
    );
    alertsFilterData._transform({}, null, (err, data) => {
      expect(data).toBe(undefined);
    });
  });

  test('receiving undefined and return undefined', () => {
    const alertsFilterData = new AlertsFilterData(
      'GLAD',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test'
    );
    alertsFilterData._transform(undefined, null, (err, data) => {
      expect(data).toBe(undefined);
    });
  });

  test('file is not an accepted value', () => {
    const alertsFilterData = new AlertsFilterData(
      'GLAD',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test',
      'alerts_new_location_file'
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
      },
      null,
      (err, data) => {
        expect(data).toEqual([]);
      }
    );
  });

  test('[Priority Location Level] Glad dont have alerts ', () => {
    const alertsFilterData = new AlertsFilterData(
      'GLAD',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test'
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'Deforestation (Integrated Alerts)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          'N/a',
        ]);
      }
    );
  });

  test('[Priority Location Level] VIIRS dont have alerts', () => {
    const alertsFilterData = new AlertsFilterData(
      'VIIRS',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test'
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'FIRES (VIIRS)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          'N/a',
        ]);
      }
    );
  });

  test('[Priority Location Level] Glad when have alerts ', () => {
    const alertsFilterData = new AlertsFilterData(
      'GLAD',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test'
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
        featureAlertTotal: 10,
        umd: 100,
        gladAlerts: true,
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'Deforestation (Integrated Alerts)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          0.1,
        ]);
      }
    );
  });

  test('[Priority Location Level] VIIRS when have alerts', () => {
    const alertsFilterData = new AlertsFilterData(
      'VIIRS',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test'
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
        featureAlertTotal: 10,
        umd: 100,
        fireAlerts: true,
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'FIRES (VIIRS)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          0.1,
        ]);
      }
    );
  });

  test('[Location Level] Glad when dont have alerts ', () => {
    const alertsFilterData = new AlertsFilterData(
      'GLAD',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test',
      ALERTS_LOCATION_LEVEL
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'Deforestation (Integrated Alerts)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          'N/a',
        ]);
      }
    );
  });

  test('[Location Level] VIIRS when dont have alerts', () => {
    const alertsFilterData = new AlertsFilterData(
      'VIIRS',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test',
      ALERTS_LOCATION_LEVEL
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'FIRES (VIIRS)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          'N/a',
        ]);
      }
    );
  });

  test('[Location Level] Glad when have alerts ', () => {
    const alertsFilterData = new AlertsFilterData(
      'GLAD',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test',
      ALERTS_LOCATION_LEVEL
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
        featureAlertTotal: 10,
        gladAlerts: true,
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'Deforestation (Integrated Alerts)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          10,
        ]);
      }
    );
  });

  test('[Location Level] VIIRS when have alerts', () => {
    const alertsFilterData = new AlertsFilterData(
      'VIIRS',
      'WEEK',
      '2020-01-01',
      '2020-01-07',
      'test',
      ALERTS_LOCATION_LEVEL
    );
    alertsFilterData._transform(
      {
        location_name: 'wri-1',
        'Sub State': 'sub state',
        State: 'state',
        Country: 'country',
        featureAlertTotal: 10,
        fireAlerts: true,
      },
      null,
      (err, data) => {
        expect(data).toEqual([
          'test',
          'wri-1',
          'sub state',
          'state',
          'country',
          'FIRES (VIIRS)',
          'WEEK',
          '2020-01-01',
          '2020-01-07',
          10,
        ]);
      }
    );
  });
});
