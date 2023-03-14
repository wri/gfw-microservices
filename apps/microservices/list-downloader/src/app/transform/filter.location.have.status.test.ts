import { FilterLocationHaveStatus } from './filter.location.have.status';

describe('FilterLocationHaveStatus', () => {
  test('Should convert object to string', () => {
    const geojson = { location_status_id: 2 }
    const filterLocationHaveStatus = new FilterLocationHaveStatus(2);
    filterLocationHaveStatus._transform(geojson, '', (err, data) => {
      expect(data).toEqual({"location_status_id": 2});
    });
  });

  test('Should convert object to string', () => {
    const geojson = { location_status_id: 4 };

    const filterLocationHaveStatus = new FilterLocationHaveStatus(2);
    filterLocationHaveStatus._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return empty json if receive empty json ', () => {
    const geojson = {}
    const filterLocationHaveStatus = new FilterLocationHaveStatus(2);
    filterLocationHaveStatus._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return undefined if receive undefined', () => {
    const listOfLocations = undefined
    const filterLocationHaveStatus = new FilterLocationHaveStatus(2);
    filterLocationHaveStatus._transform(listOfLocations, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });
});

