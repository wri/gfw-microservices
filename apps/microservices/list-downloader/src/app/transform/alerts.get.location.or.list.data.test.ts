import { AlertsGetLocationOrListData } from './alerts.get.location.or.list.data';

describe('AlertsGetLocationOrListData', () => {
  test('Should return undefined if doesnt have location_id', () => {
    const geojson = { other_field: 4 };

    const alertsGetLocationOrListData = new AlertsGetLocationOrListData();
    alertsGetLocationOrListData._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return undefined if receive empty object', () => {
    const geojson = {};
    const alertsGetLocationOrListData = new AlertsGetLocationOrListData();
    alertsGetLocationOrListData._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should not break if receive undefined', () => {
    const listOfLocations = undefined;
    const alertsGetLocationOrListData = new AlertsGetLocationOrListData();
    alertsGetLocationOrListData._transform(listOfLocations, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('if is location data  and location_id is positive should return it', () => {
    const geojson = { location_id: 2 };
    const alertsGetLocationOrListData = new AlertsGetLocationOrListData();
    alertsGetLocationOrListData._transform(geojson, '', (err, data) => {
      expect(data).toEqual({ location_id: 2 });
    });
  });

  test('if is location data  and location_id is negative should not return it', () => {
    const listOfLocations = { location_id: -1 };
    const alertsGetLocationOrListData = new AlertsGetLocationOrListData();
    alertsGetLocationOrListData._transform(listOfLocations, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('if is list data and location_id is positive should not return it', () => {
    const geojson = { location_id: 2 };
    const alertsGetLocationOrListData = new AlertsGetLocationOrListData(true);
    alertsGetLocationOrListData._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('if is list data  and location_id is negative should return it', () => {
    const listOfLocations = { location_id: -1 };
    const alertsGetLocationOrListData = new AlertsGetLocationOrListData(true);
    alertsGetLocationOrListData._transform(listOfLocations, '', (err, data) => {
      expect(data).toEqual({ location_id: -1 });
    });
  });
});
