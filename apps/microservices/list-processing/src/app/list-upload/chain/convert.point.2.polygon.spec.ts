import { Polygon } from '@wri-monorepos/geo';
import { ConvertPoint2Polygon } from './convert.point.2.polygon';
import { ChainType } from './types';
let Point;
eval("import('@arcgis/core/geometry/Point.js').then(x=>Point=x.default)");
let GeometryEngine;
eval("import('@arcgis/core/geometry/geometryEngine.js').then(x=>GeometryEngine=x)");

jest.mock('@arcgis/core/geometry/Point', () => ({
  Point: jest.fn(),
}));

jest.mock('@arcgis/core/geometry/geometryEngine', () => ({
  geodesicBuffer: jest.fn(),
}));

describe('ConvertPoint2Polygon', () => {
  let convertPoint2Polygon: ConvertPoint2Polygon;

  beforeEach(() => {
    convertPoint2Polygon = new ConvertPoint2Polygon();
  });

  it('should convert a point to a polygon with a given radius', async () => {
    const point = new Point({ latitude: 10, longitude: 20 });
    const polygonMock = {
      rings: [
        [
          /* mock coordinates */
        ],
      ],
    };
    (GeometryEngine.geodesicBuffer as jest.Mock).mockReturnValue(polygonMock);

    const input = {
      geojson: {
        features: [
          {
            geometry: { type: 'Point', coordinates: [20, 10] },
            properties: { featureRadius: '5' },
          },
        ],
      },
    } as unknown as ChainType;

    const result = await convertPoint2Polygon.handle(input);

    expect(GeometryEngine.geodesicBuffer).toHaveBeenCalledWith(point, 5, 'kilometers');
    expect(result.geojson.features[0].geometry.type).toBe('Polygon');
    expect((result.geojson.features[0].geometry as Polygon).coordinates).toEqual(polygonMock.rings);
  });

  it('should throw an error for invalid latitude or longitude', async () => {
    const input = {
      geojson: {
        features: [
          {
            geometry: { type: 'Point', coordinates: ['invalid', 10] },
            properties: {},
          },
        ],
      },
    } as unknown as ChainType;

    await expect(convertPoint2Polygon.handle(input)).rejects.toThrow(
      'Invalid latitude or longitude value'
    );
  });

  it('should throw an error for invalid radius value', async () => {
    const input = {
      geojson: {
        features: [
          {
            geometry: { type: 'Point', coordinates: [20, 10] },
            properties: { featureRadius: '-5' },
          },
        ],
      },
    } as unknown as ChainType;

    await expect(convertPoint2Polygon.handle(input)).rejects.toThrow('Invalid radius value');
  });

  it('should use default radius if no radius or area is provided', async () => {
    const point = new Point({ latitude: 10, longitude: 20 });
    const polygonMock = {
      rings: [
        [
          /* mock coordinates */
        ],
      ],
    };
    (GeometryEngine.geodesicBuffer as jest.Mock).mockReturnValue(polygonMock);

    const input = {
      geojson: {
        features: [
          {
            geometry: { type: 'Point', coordinates: [20, 10] },
            properties: {},
          },
        ],
      },
    } as unknown as ChainType;

    const result = await convertPoint2Polygon.handle(input);

    expect(GeometryEngine.geodesicBuffer).toHaveBeenCalledWith(point, 4, 'kilometers');
    expect(result.geojson.features[0].geometry.type).toBe('Polygon');
    expect(result.geojson.features[0].geometry as Polygon).toEqual(polygonMock.rings);
  });
});
