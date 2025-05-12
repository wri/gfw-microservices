import { csv2geojson } from './csv2geojson.parser';
import { FeatureCollection } from '@wri-monorepos/geo';
import axios from 'axios';
import carIdResponseMock from './carId-response-mock';
import { parse } from 'wellknown';

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('csv2geojson', () => {
  it('should correctly convert CSV data to GeoJSON format', (done) => {
    const longCVS = `Latitude,Longitude,Location Name,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Facility Name,Refinery Name,Certification,Time Horizon,company__1,owner_na_1,test_test,Start Date,End Date,Supplier Name,Errors\n66.4809422,177.6388311,random835,50,0,property,1,3000,cocoa owner name,id123,Company1,facility 12,cocoa refinery 80,No,1 year,test2,test2test2test2test2test2test2test2test3,test33,7/1/2017,7/1/2017,Cocoa24,Unable to get data from admin feature service. Location may be over water or invalid geometry.\n62.78101425,175.1506653,random1024,50,0,property,1,3000,cocoa owner name,id123,Company1,facility 12,cocoa refinery 80,No,1 year,test2,test2test2test2test2test2test2test2test3,test33,7/1/2017,7/1/2017,Cocoa24,Unable to get data from admin feature service. Location may be over water or invalid geometry.`;

    csv2geojson(longCVS).then((result) => {
      expect(result).toBeDefined();
      expect(result).toStrictEqual({
        features: [
          {
            geometry: {
              coordinates: [177.6388311, 66.4809422],
              type: 'Point',
            },
            properties: {
              'Analysis Area': 0,
              'Analysis Radius': 50,
              Certification: 'No',
              'Company ID': 1,
              'Company Name': 'Company1',
              company__1: 'test2',
              'End Date': '7/1/2017',
              Errors:
                'Unable to get data from admin feature service. Location may be over water or invalid geometry.',
              'Facility Name': 'facility 12',
              geometry: {
                coordinates: [177.6388311, 66.4809422],
                type: 'Point',
              },
              latitude: 66.4809422,
              'Location Classification': 'property',
              'Location Name': 'random835',
              longitude: 177.6388311,
              'Owner ID': 'id123',
              'Owner Name': 'cocoa owner name',
              owner_na_1: 'test2test2test2test2test2test2test2test3',
              'Refinery Name': 'cocoa refinery 80',
              'Start Date': '7/1/2017',
              'Supplier Name': 'Cocoa24',
              test_test: 'test33',
              'Time Horizon': '1 year',
              Volume: 3000,
            },
            type: 'Feature',
          },
          {
            geometry: {
              coordinates: [175.1506653, 62.78101425],
              type: 'Point',
            },
            properties: {
              'Analysis Area': 0,
              'Analysis Radius': 50,
              Certification: 'No',
              'Company ID': 1,
              'Company Name': 'Company1',
              company__1: 'test2',
              'End Date': '7/1/2017',
              Errors:
                'Unable to get data from admin feature service. Location may be over water or invalid geometry.',
              'Facility Name': 'facility 12',
              geometry: {
                coordinates: [175.1506653, 62.78101425],
                type: 'Point',
              },
              latitude: 62.78101425,
              'Location Classification': 'property',
              'Location Name': 'random1024',
              longitude: 175.1506653,
              'Owner ID': 'id123',
              'Owner Name': 'cocoa owner name',
              owner_na_1: 'test2test2test2test2test2test2test2test3',
              'Refinery Name': 'cocoa refinery 80',
              'Start Date': '7/1/2017',
              'Supplier Name': 'Cocoa24',
              test_test: 'test33',
              'Time Horizon': '1 year',
              Volume: 3000,
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('should not include features with invalid latitude or longitude values', (done) => {
    const csvData = 'Longitude,Latitude\n-120.0,38.5\n-121.5,invalid';
    csv2geojson(csvData).then((result) => {
      expect(result).toEqual({
        features: [
          {
            geometry: {
              coordinates: [-120, 38.5],
              type: 'Point',
            },
            properties: {
              geometry: {
                coordinates: [-120, 38.5],
                type: 'Point',
              },
              latitude: 38.5,
              longitude: -120,
            },
            type: 'Feature',
          },
          {
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
            properties: {
              errorDetails: ['Invalid latitude or longitude: invalid, -121.5'],
              latitude: null,
              longitude: null,
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('should remove latitude and longitude properties when includeLatLon is set to false', (done) => {
    const csvData = 'Longitude,Latitude\n-120.0,38.5\n-121.5,39.0';

    csv2geojson(csvData, false, false).then((result) => {
      expect(result).toStrictEqual({
        features: [
          {
            geometry: {
              coordinates: [-120, 38.5],
              type: 'Point',
            },
            properties: {
              geometry: {
                coordinates: [-120, 38.5],
                type: 'Point',
              },
            },
            type: 'Feature',
          },
          {
            geometry: {
              coordinates: [-121.5, 39],
              type: 'Point',
            },
            properties: {
              geometry: {
                coordinates: [-121.5, 39],
                type: 'Point',
              },
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('should return an error for invalid latitude or longitude values', (done) => {
    const csvData = 'Longitude,Latitude\n-120.0,invalid\n-121.5,39.0';
    csv2geojson(csvData).then((result) => {
      const { features } = result as FeatureCollection;
      expect(features.length).toBe(2);
      done();
    });
  });

  it('should return an error for missing fields', (done) => {
    const csvData = 'Name,Longitude,Latitude\nA,1';
    csv2geojson(csvData).then((result) => {
      const { features } = result as FeatureCollection;
      expect(features.length).toBe(1);
      expect(features[0].properties['Location Name']).toBe('Row 0');
      expect(features[0].properties['errorDetails']).toStrictEqual([
        'Too few fields: expected 3 fields but parsed 2',
      ]);
      done();
    });
  });

  it('should handle empty input correctly', (done) => {
    const csvData = '';

    csv2geojson(csvData).then((result) => {
      expect(result).toStrictEqual({
        features: [],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('should handle invalid latitude and longitude', (done) => {
    const csvData = 'Longitude,Latitude,Property1,Property2\n,,1,\n,,,2';

    csv2geojson(csvData).then((result) => {
      expect(result).toStrictEqual({
        features: [
          {
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
            properties: {
              errorDetails: ['Invalid latitude or longitude: null, null'],
              latitude: null,
              longitude: null,
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
              Property1: 1,
              Property2: null,
            },
            type: 'Feature',
          },
          {
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
            properties: {
              errorDetails: ['Invalid latitude or longitude: null, null'],
              latitude: null,
              longitude: null,
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
              Property1: null,
              Property2: 2,
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('should handle no geometry when no latitude and longitude is send correctly', (done) => {
    const csvData = 'Property1,Property2\n1,\n,2';

    csv2geojson(csvData).then((result) => {
      expect(result).toStrictEqual({
        features: [
          {
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
            properties: {
              errorDetails: ['Invalid latitude or longitude: undefined, undefined'],
              latitude: null,
              longitude: null,
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
              Property1: 1,
              Property2: null,
            },
            type: 'Feature',
          },
          {
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
            properties: {
              errorDetails: ['Invalid latitude or longitude: undefined, undefined'],
              latitude: null,
              longitude: null,
              geometry: {
                type: 'Point',
                coordinates: [0, 0],
              },
              Property1: null,
              Property2: 2,
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('Get lat long from Palm Oil Mill ID', (done) => {
    const csvData =
      'Location Name,ID,Analysis Radius,Analysis Area\r\nPalm Mill Name,PO1000000065,10,';

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        data: [
          {
            uml_id: 'PO1000000065',
            latitude: 5.641362,
            longitude: 118.166868,
          },
        ],
      },
    });

    csv2geojson(csvData).then((result) => {
      expect(result).toStrictEqual({
        features: [
          {
            geometry: {
              coordinates: [118.166868, 5.641362],
              type: 'Point',
            },
            properties: {
              'Analysis Area': null,
              'Analysis Radius': 10,
              geometry: {
                coordinates: [118.166868, 5.641362],
                type: 'Point',
              },
              ID: 'PO1000000065',
              latitude: 5.641362,
              'Location Name': 'Palm Mill Name',
              longitude: 118.166868,
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('Get lat long from Brazil CARID', (done) => {
    const csvData =
      'Location Name,ID Type,ID,Analysis Radius,Analysis Area\r\nPalm Mill Name,CAR,TO-1701903-BDF7049077694A9A8FFB13E1D88EE3F5,10,';

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        data: [carIdResponseMock],
      },
    });

    csv2geojson(csvData).then((result) => {
      const expectedGeom = parse(carIdResponseMock.geom);
      expect(result).toStrictEqual({
        features: [
          {
            geometry: expectedGeom,
            properties: {
              'Analysis Area': null,
              'Analysis Radius': 10,
              geometry: expectedGeom,
              'ID Type': 'CAR',
              ID: 'TO-1701903-BDF7049077694A9A8FFB13E1D88EE3F5',
              'Location Name': 'Palm Mill Name',
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
      done();
    });
  });
});
