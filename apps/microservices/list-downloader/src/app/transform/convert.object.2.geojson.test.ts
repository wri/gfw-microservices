import { ConvertObject2Geojson } from './convert.object.2.geojson';

describe('ConvertObject2CSV', () => {
  test('Should convert wtkgeometry to a polygon', () => {
    const geojson = {
      WKTGeometry:
        'POLYGON((10.689 -25.092, 34.595 -20.170, 38.814 -35.639, 13.502 -39.155, 10.689 -25.092))',
      test: 'test',
      total: 20,
    };
    const convertObject2CSV = new ConvertObject2Geojson();
    convertObject2CSV._transform(geojson, '', (err, data) => {
      expect(data).toEqual({
        features: [
          {
            geometry: {
              coordinates: [
                [
                  [10.689, -25.092],
                  [34.595, -20.17],
                  [38.814, -35.639],
                  [13.502, -39.155],
                  [10.689, -25.092],
                ],
              ],
              type: 'Polygon',
            },
            properties: {
              test: 'test',
              total: '20',
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
    });
  });

  test('Should work without wtkgeometry and return other fields as properties', () => {
    const geojson = {
      test: 'test',
      total: 20,
    };
    const convertObject2CSV = new ConvertObject2Geojson();
    convertObject2CSV._transform(geojson, '', (err, data) => {
      expect(data).toEqual({
        features: [
          {
            geometry: {},
            properties: {
              test: 'test',
              total: '20',
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      });
    });
  });

  test('Should return empty geojson when receive undefined', () => {
    const convertObject2CSV = new ConvertObject2Geojson();
    convertObject2CSV._transform(undefined, '', (err, data) => {
      expect(data).toEqual({
        type: 'FeatureCollection',
        features: [],
      });
    });
  });

  test('Should return empty geojson when receive {}', () => {
    const convertObject2CSV = new ConvertObject2Geojson();
    convertObject2CSV._transform({}, '', (err, data) => {
      expect(data).toEqual({
        type: 'FeatureCollection',
        features: [
          {
            geometry: {},
            properties: {},
            type: 'Feature',
          },
        ],
      });
    });
  });
});
