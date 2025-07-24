import { AdjustGeoData } from './adjust.geo.data';
import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import * as turf from '@turf/turf';
import { ChainType, PreviewListRequest } from './types';

describe('AdjustGeoData', () => {
  let adjustGeoData: AdjustGeoData;

  beforeEach(() => {
    adjustGeoData = new AdjustGeoData();
  });

  describe('handle', () => {
    it('should process features and add latitude, longitude, and analysisArea properties', async () => {
      const mockFeature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      const request: ChainType = {
        geojson: {
          type: 'FeatureCollection',
          features: [mockFeature],
        } as FeatureCollection,
        request: {
          path: 'test-path',
          preview: true,
        } as PreviewListRequest,
      };

      const result = await adjustGeoData.handle(request);

      expect(result.geojson.features[0].properties).toHaveProperty('latitude');
      expect(result.geojson.features[0].properties).toHaveProperty('longitude');
      expect(result.geojson.features[0].properties).toHaveProperty('analysisArea');
    });
  });

  describe('getHectaresFromFeature', () => {
    it('should return existing analysisArea if present', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { analysisArea: 100 },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      const result = adjustGeoData.getHectaresFromFeature(feature);
      expect(result).toBe(100);
    });

    it('should calculate area for polygon and convert to hectares', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      const result = adjustGeoData.getHectaresFromFeature(feature);
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for non-polygon features without analysisArea', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      };

      const result = adjustGeoData.getHectaresFromFeature(feature);
      expect(result).toBe(0);
    });
  });

  describe('getLatLngFromFeature', () => {
    it('should return existing latitude and longitude from properties', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {
          latitude: 40,
          longitude: -70,
        },
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      };

      const result = adjustGeoData.getLatLngFromFeature(feature);
      expect(result).toEqual({
        latitude: 40,
        longitude: -70,
      });
    });

    it('should calculate centroid for polygon features', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      const result = adjustGeoData.getLatLngFromFeature(feature);
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).not.toHaveProperty('hasUnanalyzableError');
    });

    it('should calculate center of mass regardless of extraneous points', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [0.1, 0],
              [0.5, 0],
              [0.8, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      const result = adjustGeoData.getLatLngFromFeature(feature);
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).not.toHaveProperty('hasUnanalyzableError');
    });

    it('should return point coordinates for point features', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [10, 20],
        },
      };

      const result = adjustGeoData.getLatLngFromFeature(feature);
      expect(result).toEqual({
        latitude: 20,
        longitude: 10,
      });
    });

    it('should return first point coordinates for polygon when centroid fails', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      // Mock turf.centerOfMass to throw an error
      jest.spyOn(turf, 'centerOfMass').mockImplementation(() => {
        throw new Error('Center of mass calculation failed');
      });

      const result = adjustGeoData.getLatLngFromFeature(feature);
      expect(result).toEqual({
        latitude: 0,
        longitude: 0,
      });
    });

    it('should return default coordinates with error flag when feature is unanalyzable', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
      };

      const result = adjustGeoData.getLatLngFromFeature(feature);
      expect(result).toEqual({
        latitude: 0,
        longitude: 0,
        hasUnanalyzableError: true,
      });
    });
  });
});
