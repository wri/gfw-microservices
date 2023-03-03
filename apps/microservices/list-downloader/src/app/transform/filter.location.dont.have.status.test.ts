import { FilterLocationDontHaveStatus } from './filter.location.dont.have.status';

describe('FilterLocationDontHaveStatus', () => {
  test('Should convert object to string', () => {
    const geojson = { location_status_id: 2 }
    const filterLocationDontHaveStatus = new FilterLocationDontHaveStatus(2);
    filterLocationDontHaveStatus._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should convert object to string', () => {
    const geojson = { location_status_id: 4 };

    const filterLocationDontHaveStatus = new FilterLocationDontHaveStatus(2);
    filterLocationDontHaveStatus._transform(geojson, '', (err, data) => {
      expect(data).toEqual({"location_status_id": 4});
    });
  });

  test('Should return empty json if receive empty json ', () => {
    const geojson = {}
    const filterLocationDontHaveStatus = new FilterLocationDontHaveStatus(2);
    filterLocationDontHaveStatus._transform(geojson, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });

  test('Should return undefined if receive undefined', () => {
    const listOfLocations = undefined
    const filterLocationDontHaveStatus = new FilterLocationDontHaveStatus(2);
    filterLocationDontHaveStatus._transform(listOfLocations, '', (err, data) => {
      expect(data).toEqual(undefined);
    });
  });
});

