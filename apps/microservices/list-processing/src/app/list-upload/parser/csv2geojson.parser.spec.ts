import { csv2geojson } from './csv2geojson.parser';
import { FeatureCollection } from '@wri-monorepos/geo'; // Adjust the import according to your file structure
import axios from 'axios';

jest.mock('axios');

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
              analysisArea: 0,
              analysisRadius: 50,
              certification: 'No',
              companyId: 1,
              companyName: 'Company1',
              company__1: 'test2',
              endDate: '7/1/2017',
              errors:
                'Unable to get data from admin feature service. Location may be over water or invalid geometry.',
              facilityName: 'facility 12',
              geometry: {
                coordinates: [177.6388311, 66.4809422],
                type: 'Point',
              },
              latitude: 66.4809422,
              locationClassification: 'property',
              locationName: 'random835',
              longitude: 177.6388311,
              ownerId: 'id123',
              ownerName: 'cocoa owner name',
              owner_na_1: 'test2test2test2test2test2test2test2test3',
              refineryName: 'cocoa refinery 80',
              startDate: '7/1/2017',
              supplierName: 'Cocoa24',
              test_test: 'test33',
              timeHorizon: '1 year',
              volume: 3000,
            },
            type: 'Feature',
          },
          {
            geometry: {
              coordinates: [175.1506653, 62.78101425],
              type: 'Point',
            },
            properties: {
              analysisArea: 0,
              analysisRadius: 50,
              certification: 'No',
              companyId: 1,
              companyName: 'Company1',
              company__1: 'test2',
              endDate: '7/1/2017',
              errors:
                'Unable to get data from admin feature service. Location may be over water or invalid geometry.',
              facilityName: 'facility 12',
              geometry: {
                coordinates: [175.1506653, 62.78101425],
                type: 'Point',
              },
              latitude: 62.78101425,
              locationClassification: 'property',
              locationName: 'random1024',
              longitude: 175.1506653,
              ownerId: 'id123',
              ownerName: 'cocoa owner name',
              owner_na_1: 'test2test2test2test2test2test2test2test3',
              refineryName: 'cocoa refinery 80',
              startDate: '7/1/2017',
              supplierName: 'Cocoa24',
              test_test: 'test33',
              timeHorizon: '1 year',
              volume: 3000,
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
            geometry: undefined,
            properties: {
              errordetails: ['Invalid latitude or longitude: invalid, -121.5'],
              latitude: 'invalid',
              longitude: -121.5,
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
    const csvData = 'Longitude,Latitude,Property1,Property2\n,,,\n,,,';

    csv2geojson(csvData).then((result) => {
      expect(result).toStrictEqual({
        features: [
          {
            geometry: undefined,
            properties: {
              errordetails: ['Invalid latitude or longitude: null, null'],
              latitude: null,
              longitude: null,
              property1: null,
              property2: null,
            },
            type: 'Feature',
          },
          {
            geometry: undefined,
            properties: {
              errordetails: ['Invalid latitude or longitude: null, null'],
              latitude: null,
              longitude: null,
              property1: null,
              property2: null,
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
    const csvData = 'Property1,Property2\n,\n,';

    csv2geojson(csvData).then((result) => {
      expect(result).toStrictEqual({
        features: [
          {
            geometry: undefined,
            properties: {
              errordetails: ['Invalid latitude or longitude: undefined, undefined'],
              property1: null,
              property2: null,
            },
            type: 'Feature',
          },
          {
            geometry: undefined,
            properties: {
              errordetails: ['Invalid latitude or longitude: undefined, undefined'],
              property1: null,
              property2: null,
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
              analysisArea: null,
              analysisRadius: 10,
              geometry: {
                coordinates: [118.166868, 5.641362],
                type: 'Point',
              },
              id: 'PO1000000065',
              latitude: 5.641362,
              locationName: 'Palm Mill Name',
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
});
