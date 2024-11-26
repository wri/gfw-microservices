import { csv2geojson } from './csv2geojson.parser';
import { FeatureCollection } from '@wri-monorepos/geo'; // Adjust the import according to your file structure

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
              attributes:
                '{"analysisRadius":{"field":"Analysis Radius","value":50,"type":"number"},"analysisArea":{"field":"Analysis Area","value":0,"type":"number"},"locationClassification":{"field":"Location Classification","value":"property","type":"string"},"companyId":{"field":"Company ID","value":1,"type":"number","custom":true},"volume":{"field":"Volume","value":3000,"type":"number"},"ownerName":{"field":"Owner Name","value":"cocoa owner name","type":"string"},"ownerId":{"field":"Owner ID","value":"id123","type":"string","custom":true},"companyName":{"field":"Company Name","value":"Company1","type":"string"},"facilityName":{"field":"Facility Name","value":"facility 12","type":"string","custom":true},"refineryName":{"field":"Refinery Name","value":"cocoa refinery 80","type":"string"},"certification":{"field":"Certification","value":"No","type":"string"},"timeHorizon":{"field":"Time Horizon","value":"1 year","type":"string"},"company__1":{"field":"company__1","value":"test2","type":"string","custom":true},"owner_na_1":{"field":"owner_na_1","value":"test2test2test2test2test2test2test2test3","type":"string","custom":true},"test_test":{"field":"test_test","value":"test33","type":"string","custom":true},"startDate":{"field":"Start Date","value":"7/1/2017","type":"string"},"endDate":{"field":"End Date","value":"7/1/2017","type":"string"},"supplierName":{"field":"Supplier Name","value":"Cocoa24","type":"string"},"errors":{"field":"Errors","value":"Unable to get data from admin feature service. Location may be over water or invalid geometry.","type":"string","custom":true}}',
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
              attributes:
                '{"analysisRadius":{"field":"Analysis Radius","value":50,"type":"number"},"analysisArea":{"field":"Analysis Area","value":0,"type":"number"},"locationClassification":{"field":"Location Classification","value":"property","type":"string"},"companyId":{"field":"Company ID","value":1,"type":"number","custom":true},"volume":{"field":"Volume","value":3000,"type":"number"},"ownerName":{"field":"Owner Name","value":"cocoa owner name","type":"string"},"ownerId":{"field":"Owner ID","value":"id123","type":"string","custom":true},"companyName":{"field":"Company Name","value":"Company1","type":"string"},"facilityName":{"field":"Facility Name","value":"facility 12","type":"string","custom":true},"refineryName":{"field":"Refinery Name","value":"cocoa refinery 80","type":"string"},"certification":{"field":"Certification","value":"No","type":"string"},"timeHorizon":{"field":"Time Horizon","value":"1 year","type":"string"},"company__1":{"field":"company__1","value":"test2","type":"string","custom":true},"owner_na_1":{"field":"owner_na_1","value":"test2test2test2test2test2test2test2test3","type":"string","custom":true},"test_test":{"field":"test_test","value":"test33","type":"string","custom":true},"startDate":{"field":"Start Date","value":"7/1/2017","type":"string"},"endDate":{"field":"End Date","value":"7/1/2017","type":"string"},"supplierName":{"field":"Supplier Name","value":"Cocoa24","type":"string"},"errors":{"field":"Errors","value":"Unable to get data from admin feature service. Location may be over water or invalid geometry.","type":"string","custom":true}}',
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
              attributes: '{}',
              geometry: {
                coordinates: [-120, 38.5],
                type: 'Point',
              },
              latitude: 38.5,
              longitude: -120,
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
              attributes: '{}',
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
              attributes: '{}',
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
      expect(features.length).toBe(1);
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
        features: [],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('should handle no geometry when no latitude and longitude is send correctly', (done) => {
    const csvData = 'Property1,Property2\n,\n,';

    csv2geojson(csvData).then((result) => {
      expect(result).toStrictEqual({
        features: [],
        type: 'FeatureCollection',
      });
      done();
    });
  });

  it('should include the original field names in attributes', async () => {
    const csvData = `Latitude,Longitude,Location Name,Shipping Units,Custom Field
66.4809422,177.6388311,random835,3,CustomValue`;

    const result = await csv2geojson(csvData);
    const { features } = result as FeatureCollection;

    const attributes = JSON.parse(features[0].properties.attributes as string);

    // verify that 'field' property matches the original CSV header
    expect(attributes.shippingUnits.field).toBe('Shipping Units');
    expect(attributes.customField.field).toBe('Custom Field');
  });

  it('should include the type and handle empty values as strings', async () => {
    const csvData = `Latitude,Longitude,Shipping Units,Custom Field
66.4809422,177.6388311,,`;

    const result = await csv2geojson(csvData);
    const { features } = result as FeatureCollection;

    const attributes = JSON.parse(features[0].properties.attributes as string);

    // empty values handled as empty strings with type 'string'
    expect(attributes.shippingUnits.value).toBe('');
    expect(attributes.shippingUnits.type).toBe('string');
  });

  it('should mark custom fields with custom: true', async () => {
    const csvData = `Latitude,Longitude,Custom Field
66.4809422,177.6388311,CustomValue`;

    const result = await csv2geojson(csvData);
    const { features } = result as FeatureCollection;

    const attributes = JSON.parse(features[0].properties.attributes as string);

    // 'customField' is not in the entity definition, so it should be marked as custom
    expect(attributes.customField.custom).toBe(true);
  });

  it('should exclude required fields and columnsToExclude from attributes', async () => {
    const csvData = `Latitude,Longitude,Volume,Commodity
66.4809422,177.6388311,3000,Oil`;

    const result = await csv2geojson(csvData);
    const { features } = result as FeatureCollection;

    const attributes = JSON.parse(features[0].properties.attributes as string);

    // 'volume' is an optional field and should be present attributes
    expect(attributes).toHaveProperty('volume');
    // 'commodity' is in columnsToExclude and should not be in attributes
    expect(attributes).not.toHaveProperty('commodity');
  });
});
