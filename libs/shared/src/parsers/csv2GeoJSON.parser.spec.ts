import { csv2geojson } from './csv2GeoJSON.parser'; // Adjust the import according to your file structure

describe('csv2geojson', () => {
  it('should correctly convert CSV data to GeoJSON format', (done) => {
    const longCVS = `Latitude,Longitude,Location Name,Analysis Radius,Analysis Area,Location Classification,Company ID,Volume,Owner Name,Owner ID,Company Name,Facility Name,Refinery Name,Certification,Time Horizon,company__1,owner_na_1,test_test,Start Date,End Date,Supplier Name,Errors\n66.4809422,177.6388311,random835,50,0,property,1,3000,cocoa owner name,id123,Company1,facility 12,cocoa refinery 80,No,1 year,test2,test2test2test2test2test2test2test2test3,test33,7/1/2017,7/1/2017,Cocoa24,Unable to get data from admin feature service. Location may be over water or invalid geometry.\n62.78101425,175.1506653,random1024,50,0,property,1,3000,cocoa owner name,id123,Company1,facility 12,cocoa refinery 80,No,1 year,test2,test2test2test2test2test2test2test2test3,test33,7/1/2017,7/1/2017,Cocoa24,Unable to get data from admin feature service. Location may be over water or invalid geometry.`;
    const options = { delimiter: ',' };

    const [result, err] = csv2geojson(longCVS, options);
    expect(err).toHaveLength(0);
    expect(result).toBeDefined();
    expect(result.features.length).toBe(2);
    expect(result.features[0].geometry.coordinates).toEqual([177.6388311, 66.4809422]);
    done();
  });

  it('should not include features with invalid latitude or longitude values', (done) => {
    const csvData = 'Longitude,Latitude\n-120.0,38.5\n-121.5,invalid';
    const options = { delimiter: ',' };

    const [result, err] = csv2geojson(csvData, options);
    expect(err).toHaveLength(1);
    expect(result).toBeDefined();
    expect(result.features.length).toBe(1);
    expect(result.features[0].geometry.coordinates).toEqual([-120.0, 38.5]);
    done();
  });

  it('should remove latitude and longitude properties when includeLatLon is set to false', (done) => {
    const csvData = 'Longitude,Latitude\n-120.0,38.5\n-121.5,39.0';
    const options = { delimiter: ',', includeLatLon: false };

    const [result, err] = csv2geojson(csvData, options);
    expect(err).toHaveLength(0);
    expect(result).toBeDefined();
    expect(result.features.length).toBe(2);
    expect(result.features[0].geometry.coordinates).toEqual([-120.0, 38.5]);
    expect(result.features[0].properties).not.toHaveProperty('Longitude');
    expect(result.features[0].properties).not.toHaveProperty('Latitude');
    done();
  });

  it('should return an error for invalid latitude or longitude values', (done) => {
    const csvData = 'Longitude,Latitude\n-120.0,invalid\n-121.5,39.0';
    const options = { delimiter: ',' };

    const [, err] = csv2geojson(csvData, options);
    expect(err).toBeDefined();
    expect(err.length).toBeGreaterThan(0);
    expect(err[0].message).toContain('invalid value for latitude or longitude');
    done();
  });

  // test disbabled due to the fact that the function is disabled
  xit('should autodetect delimiter when set to auto', (done) => {
    const csvData = 'Longitude;Latitude\n-120.0;38.5\n-121.5;39.0';
    const options = { delimiter: 'auto' };

    const [result, err] = csv2geojson(csvData, options);
    expect(err).toHaveLength(0);
    expect(result).toBeDefined();
    expect(result.features.length).toBe(2);
    expect(result.features[0].geometry.coordinates).toEqual([-120.0, 38.5]);
    done();
  });

  it('should handle empty input correctly', (done) => {
    const csvData = '';
    const options = { delimiter: ',' };

    const [result, err] = csv2geojson(csvData, options);
    expect(err).toHaveLength(0);
    expect(result.features.length).toBe(0);
    done();
  });

  it('should handle invalid latitude and longitude', (done) => {
    const csvData = 'Longitude,Latitude,Property1,Property2\n,,,\n,,,';
    const options = { delimiter: ',' };

    const [result, err] = csv2geojson(csvData, options);
    expect(err).toHaveLength(2);
    expect(result.features.length).toBe(0);
    done();
  });

  it('should handle no geometry when no latitude and longitude is send correctly', (done) => {
    const csvData = 'Property1,Property2\n,,\n,,';
    const options = { delimiter: ',' };

    const [result, err] = csv2geojson(csvData, options);
    expect(err).toHaveLength(0);
    expect(result.features.length).toBe(2);
    done();
  });
});
