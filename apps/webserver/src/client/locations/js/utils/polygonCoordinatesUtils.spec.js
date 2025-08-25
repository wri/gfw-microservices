import Graphic from '@arcgis/core/Graphic';
import { getPointGeometry, getPolygonGeometry } from './geometries';
import {
  newCoordinate,
  isValidLatitude,
  isValidLongitude,
  createGeometryAndGraphic,
  extractCoordinates,
} from './polygonCoordinatesUtils';

jest.mock('@arcgis/core/symbols/SimpleFillSymbol');
jest.mock('@arcgis/core/Graphic');
jest.mock('./geometries');

jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => {
  return jest.fn().mockImplementation(() => {
    return {
      color: [],
      outline: {
        color: [],
        width: 0,
      },
    };
  });
});

jest.mock('@arcgis/core/Graphic', () => {
  return jest.fn().mockImplementation(() => {
    return {
      geometry: null,
      symbol: null,
    };
  });
});

beforeAll(() => {
  jest.spyOn(global.crypto, 'randomUUID').mockReturnValue('mock-random-uuid');
});

afterAll(() => {
  global.crypto.randomUUID.mockRestore();
});

describe('PolygonCoordinatesInput utilities', () => {
  describe('newCoordinate', () => {
    it('should create a new coordinate object with a unique id', () => {
      const result = newCoordinate();
      expect(result).toEqual({
        id: 'mock-random-uuid',
        latitude: '',
        longitude: '',
        errors: {},
      });
    });
  });

  describe('isValidLatitude', () => {
    it('should return true for valid latitude values', () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
    });

    it('should return false for invalid latitude values', () => {
      expect(isValidLatitude(null)).toBe(false);
      expect(isValidLatitude(91)).toBe(false);
      expect(isValidLatitude(-91)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('should return true for valid longitude values', () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
    });

    it('should return false for invalid longitude values', () => {
      expect(isValidLongitude(null)).toBe(false);
      expect(isValidLongitude(181)).toBe(false);
      expect(isValidLongitude(-181)).toBe(false);
    });
  });

  describe('extractCoordinates', () => {
    it('should extract coordinates from a geometry object', () => {
      const geometry = {
        rings: [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
        ],
      };

      const expectedCoordinates = [
        { id: 'mock-random-uuid', latitude: 0, longitude: 100, errors: {} },
        { id: 'mock-random-uuid', latitude: 0, longitude: 101, errors: {} },
        { id: 'mock-random-uuid', latitude: 1, longitude: 101, errors: {} },
        { id: 'mock-random-uuid', latitude: 1, longitude: 100, errors: {} },
        { id: 'mock-random-uuid', latitude: 0, longitude: 100, errors: {} },
      ];

      const result = extractCoordinates(geometry);
      expect(result).toEqual(expectedCoordinates);
    });

    it('should return an empty array for geometry with less than 2 vertices', () => {
      const geometry = {
        rings: [[[100.0, 0.0]]],
      };

      const result = extractCoordinates(geometry);
      expect(result).toEqual([]);
    });
  });

  describe('createGeometryAndGraphic', () => {
    it('should create a point geometry and graphic', () => {
      const mockGeometry = { type: 'point' };
      const mockGraphic = { geometry: mockGeometry, symbol: {} };

      getPointGeometry.mockReturnValue(mockGeometry);
      Graphic.mockImplementation(() => mockGraphic);

      const coordinates = [{ id: '1', latitude: 0, longitude: 0 }];
      const result = createGeometryAndGraphic({
        coordinates,
        isPolygon: false,
        selectedAreaRadioOption: null,
        measurementUnit: null,
        customArea: null,
      });

      expect(getPointGeometry).toHaveBeenCalledWith(coordinates, null, null, null);
      expect(result).toEqual({ geometry: mockGeometry, graphic: mockGraphic });
    });

    it('should create a polygon geometry and graphic', () => {
      const mockGeometry = { type: 'polygon' };
      const mockGraphic = { geometry: mockGeometry, symbol: {} };

      getPolygonGeometry.mockReturnValue(mockGeometry);
      Graphic.mockImplementation(() => mockGraphic);

      const coordinates = [
        { id: '1', latitude: 0, longitude: 0 },
        { id: '2', latitude: 1, longitude: 1 },
      ];
      const result = createGeometryAndGraphic({
        coordinates,
        isPolygon: true,
        selectedAreaRadioOption: null,
        measurementUnit: null,
        customArea: null,
      });

      expect(getPolygonGeometry).toHaveBeenCalledWith([
        { id: '1', latitude: 0, longitude: 0 },
        { id: '2', latitude: 1, longitude: 1 },
        { id: '1', latitude: 0, longitude: 0 },
      ]);
      expect(result).toEqual({ geometry: mockGeometry, graphic: mockGraphic });
    });
  });
});
