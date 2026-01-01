const { describe, it, expect } = require('@jest/globals');
const vectorTileGeojsonUtils = require('./vectorTileGeojson.utils');

describe('vectorTileGeojson.utils', () => {
  describe('convertToGeojson', () => {
    it('should convert WKT geometries to GeoJSON', () => {
      const input = [
        { location_id: 1, Geometry: 'POINT(0 0)', name: 'Point A' },
        { location_id: 2, Geometry: 'POINT(1 1)', name: 'Point B' },
      ];

      const result = vectorTileGeojsonUtils.convertToGeojson(input);

      expect(result).toHaveProperty('type', 'FeatureCollection');
      expect(result.features).toHaveLength(2);
      expect(result.features[0]).toHaveProperty('type', 'Feature');
      expect(result.features[0]).toHaveProperty('geometry');
      expect(result.features[0].properties).toHaveProperty('location_id', 1);
      expect(result.features[0].properties).toHaveProperty('name', 'Point A');
    });

    it('should handle polygon geometries', () => {
      const input = [
        {
          location_id: 3,
          Geometry: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
        },
      ];

      const result = vectorTileGeojsonUtils.convertToGeojson(input);

      expect(result.features[0].geometry.type).toBe('Polygon');
      expect(result.features[0].geometry.coordinates).toBeDefined();
    });

    it('should handle multipolygon geometries', () => {
      const input = [
        {
          location_id: 4,
          Geometry: 'MULTIPOLYGON(((0 0, 1 0, 1 1, 0 1, 0 0)))',
        },
      ];

      const result = vectorTileGeojsonUtils.convertToGeojson(input);

      expect(result.features[0].geometry.type).toBe('MultiPolygon');
    });

    it('should skip invalid geometries', () => {
      const input = [
        { location_id: 1, Geometry: 'INVALID', name: 'Bad' },
        { location_id: 2, Geometry: 'POINT(0 0)', name: 'Good' },
      ];

      const result = vectorTileGeojsonUtils.convertToGeojson(input);

      expect(result.features).toHaveLength(1);
      expect(result.features[0].properties.location_id).toBe(2);
    });

    it('should return empty FeatureCollection for empty input', () => {
      const result = vectorTileGeojsonUtils.convertToGeojson([]);

      expect(result).toEqual({
        type: 'FeatureCollection',
        features: [],
      });
    });

    it('should preserve all properties except Geometry', () => {
      const input = [
        {
          location_id: 1,
          Geometry: 'POINT(0 0)',
          name: 'Test',
          country: 'USA',
          area: 1000,
        },
      ];

      const result = vectorTileGeojsonUtils.convertToGeojson(input);

      expect(result.features[0].properties).toEqual({
        location_id: 1,
        name: 'Test',
        country: 'USA',
        area: 1000,
      });
      expect(result.features[0].properties).not.toHaveProperty('Geometry');
    });
  });

  describe('validateGeojson', () => {
    it('should return true for valid GeoJSON', () => {
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
          },
        ],
      };

      const result = vectorTileGeojsonUtils.validateGeojson(geojson);

      expect(result).toBe(true);
    });

    it('should return false for invalid type', () => {
      const geojson = {
        type: 'InvalidType',
        features: [],
      };

      const result = vectorTileGeojsonUtils.validateGeojson(geojson);

      expect(result).toBe(false);
    });

    it('should return false when features is not an array', () => {
      const geojson = {
        type: 'FeatureCollection',
        features: 'not an array',
      };

      const result = vectorTileGeojsonUtils.validateGeojson(geojson);

      expect(result).toBe(false);
    });
  });
});
