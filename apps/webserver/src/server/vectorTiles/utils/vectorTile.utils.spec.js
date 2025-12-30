const { describe, it, expect, jest } = require('@jest/globals');
const vectorTileUtils = require('./vectorTile.utils');

describe('vectorTile.utils', () => {
  describe('getTileCoordinates', () => {
    it('should convert lat/lng to tile coordinates at zoom 10', () => {
      const result = vectorTileUtils.getTileCoordinates(40.7128, -74.0060, 10);

      expect(result).toHaveProperty('x');
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('z');
      expect(result.z).toBe(10);
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });

    it('should handle equator coordinates', () => {
      const result = vectorTileUtils.getTileCoordinates(0, 0, 5);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for invalid zoom level', () => {
      expect(() => {
        vectorTileUtils.getTileCoordinates(40, -74, -1);
      }).toThrow();
    });

    it('should throw error for invalid latitude', () => {
      expect(() => {
        vectorTileUtils.getTileCoordinates(91, -74, 10);
      }).toThrow();
    });

    it('should throw error for invalid longitude', () => {
      expect(() => {
        vectorTileUtils.getTileCoordinates(40, 181, 10);
      }).toThrow();
    });
  });

  describe('getBoundingBox', () => {
    it('should return bounding box for given tile coordinates', () => {
      const bbox = vectorTileUtils.getBoundingBox(512, 384, 10);

      expect(bbox).toHaveProperty('minLng');
      expect(bbox).toHaveProperty('minLat');
      expect(bbox).toHaveProperty('maxLng');
      expect(bbox).toHaveProperty('maxLat');
      expect(bbox.minLng).toBeLessThan(bbox.maxLng);
      expect(bbox.minLat).toBeLessThan(bbox.maxLat);
    });

    it('should handle tile at origin', () => {
      const bbox = vectorTileUtils.getBoundingBox(0, 0, 0);

      expect(bbox.minLng).toBe(-180);
      expect(bbox.maxLng).toBe(180);
    });
  });

  describe('getTilePath', () => {
    it('should generate S3 path for tile', () => {
      const path = vectorTileUtils.getTilePath('list123', 10, 512, 384);

      expect(path).toContain('list123');
      expect(path).toContain('/10/');
      expect(path).toContain('/512/');
      expect(path).toContain('384.pbf');
    });

    it('should sanitize listId', () => {
      const path = vectorTileUtils.getTilePath('../evil', 5, 10, 20);

      expect(path).not.toContain('..');
    });
  });

  describe('validateTileParameters', () => {
    it('should return true for valid parameters', () => {
      const result = vectorTileUtils.validateTileParameters(10, 512, 384);

      expect(result).toBe(true);
    });

    it('should return false for negative zoom', () => {
      const result = vectorTileUtils.validateTileParameters(-1, 512, 384);

      expect(result).toBe(false);
    });

    it('should return false for x out of range', () => {
      const result = vectorTileUtils.validateTileParameters(10, 10000, 384);

      expect(result).toBe(false);
    });

    it('should return false for y out of range', () => {
      const result = vectorTileUtils.validateTileParameters(10, 512, 10000);

      expect(result).toBe(false);
    });

    it('should return false for zoom > 22', () => {
      const result = vectorTileUtils.validateTileParameters(25, 512, 384);

      expect(result).toBe(false);
    });
  });
});