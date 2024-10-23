import { ConvertPoint2Polygon } from './convert.point.2.polygon';
import { point } from '@turf/helpers';
import { ChainType } from './types';

describe('ConvertPoint2Polygon', () => {
  let converter: ConvertPoint2Polygon;

  beforeEach(() => {
    converter = new ConvertPoint2Polygon();
  });

  describe('geomFromPointRadiusArea', () => {
    it('should calculate geometry from point and radius', async () => {
      const geoPoint = point([0, 0]);
      const radius = '5';
      const geometry = await converter.geomFromPointRadiusArea(geoPoint, radius, null);
      expect(geometry.type).toBe('Polygon');
    });

    it('should calculate geometry from point and area', async () => {
      const geoPoint = point([0, 0]);
      const area = '314.16'; // approximately 10 km radius
      const geometry = await converter.geomFromPointRadiusArea(geoPoint, null, area);
      expect(geometry.type).toBe('Polygon');
    });

    it('should throw an error for invalid radius', async () => {
      const geoPoint = point([0, 0]);
      await expect(converter.geomFromPointRadiusArea(geoPoint, '-5', null)).rejects.toThrow('Invalid radius value');
    });

    it('should throw an error for invalid area', async () => {
      const geoPoint = point([0, 0]);
      await expect(converter.geomFromPointRadiusArea(geoPoint, null, '-314.16')).rejects.toThrow('Invalid area value');
    });
  });

  describe('geomFromLatLongRadiusArea', () => {
    it('should calculate geometry from latitude, longitude, and radius', async () => {
      const latitude = '0';
      const longitude = '0';
      const radius = '5';
      const geometry = await converter.geomFromLatLongRadiusArea(latitude, longitude, radius, null);
      expect(geometry.type).toBe('Polygon');
    });

    it('should throw an error for invalid latitude or longitude', async () => {
      await expect(converter.geomFromLatLongRadiusArea('invalid', '0', '5', null)).rejects.toThrow('Invalid latitude or longitude value');
    });
  });

  describe('handle', () => {
    it('should convert point features to polygon features', async () => {
      const input = ({
        request: {
          path: 'path',
        },
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              geometry: {
                type: 'Point',
                coordinates: [0, 0]
              },
              properties: {
                featureRadius: '5'
              }
            }
          ]
        }
      } as unknown as ChainType);

      const output = await converter.handle(input);
      expect(output.geojson.features[0].geometry.type).toBe('Polygon');
    });
  });
});
