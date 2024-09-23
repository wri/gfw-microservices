import {
  pointsEqual,
  closeRing,
  ringIsClockwise,
  vertexIntersectsVertex,
  arrayIntersectsArray,
  coordinatesContainPoint,
  coordinatesContainCoordinates,
  convertRingsToGeoJSON,
  orientRings,
  flattenMultiPolygonRings,
  shallowClone,
  arcgisToGeoJSON,
  geojsonToArcGIS,
  Ring,
  Point,
  MultiPolygon,
} from './arcgis-to-geojson'; // Adjust the import path as necessary

describe('Geometry Utils', () => {
  test('pointsEqual should return true for equal points', () => {
    expect(pointsEqual([1, 2], [1, 2])).toBe(true);
  });

  test('pointsEqual should return false for different points', () => {
    expect(pointsEqual([1, 2], [2, 1])).toBe(false);
  });

  test('closeRing should close an open ring', () => {
    const ring: Ring = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    expect(closeRing(ring)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ]);
  });

  test('closeRing should not modify a closed ring', () => {
    const ring: Ring = [
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ];
    expect(closeRing(ring)).toEqual(ring);
  });

  test('ringIsClockwise should return false for a counter-clockwise ring', () => {
    const ring: Ring = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ];
    expect(ringIsClockwise(ring)).toBe(false); // This should be false for the given points
  });

  test('ringIsClockwise should return true for a clockwise ring', () => {
    const ring: Ring = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ];
    expect(ringIsClockwise(ring)).toBe(true); // This should be true for the given points
  });

  test('vertexIntersectsVertex should return true for intersecting segments', () => {
    const a1: Point = [0, 0];
    const a2: Point = [1, 1];
    const b1: Point = [0, 1];
    const b2: Point = [1, 0];
    expect(vertexIntersectsVertex(a1, a2, b1, b2)).toBe(true);
  });

  test('vertexIntersectsVertex should return false for non-intersecting segments', () => {
    const a1: Point = [0, 0];
    const a2: Point = [1, 1];
    const b1: Point = [1, 0];
    const b2: Point = [2, 1];
    expect(vertexIntersectsVertex(a1, a2, b1, b2)).toBe(false);
  });

  test('arrayIntersectsArray should return true for intersecting arrays', () => {
    const a: Ring = [
      [0, 0],
      [1, 1],
      [2, 0],
    ];
    const b: Ring = [
      [0, 1],
      [1, 0],
      [2, 1],
    ];
    expect(arrayIntersectsArray(a, b)).toBe(true);
  });

  test('arrayIntersectsArray should return false for non-intersecting arrays', () => {
    const a: Ring = [
      [0, 0],
      [1, 1],
      [2, 0],
    ];
    const b: Ring = [
      [3, 1],
      [4, 0],
      [5, 1],
    ];
    expect(arrayIntersectsArray(a, b)).toBe(false);
  });

  test('coordinatesContainPoint should return true for a point inside the coordinates', () => {
    const coordinates: Ring = [
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0],
      [0, 0],
    ];
    const point: Point = [1, 1];
    expect(coordinatesContainPoint(coordinates, point)).toBe(true);
  });

  test('coordinatesContainPoint should return false for a point outside the coordinates', () => {
    const coordinates: Ring = [
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0],
      [0, 0],
    ];
    const point: Point = [3, 3];
    expect(coordinatesContainPoint(coordinates, point)).toBe(false);
  });

  test('coordinatesContainCoordinates should return true for inner coordinates within outer coordinates', () => {
    const outer: Ring = [
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0],
      [0, 0],
    ];
    const inner: Ring = [
      [1, 1],
      [1, 1.5],
      [1.5, 1.5],
      [1.5, 1],
      [1, 1],
    ];
    expect(coordinatesContainCoordinates(outer, inner)).toBe(true);
  });

  test('coordinatesContainCoordinates should return false for inner coordinates outside outer coordinates', () => {
    const outer: Ring = [
      [0, 0],
      [0, 2],
      [2, 2],
      [2, 0],
      [0, 0],
    ];
    const inner: Ring = [
      [3, 3],
      [3, 4],
      [4, 4],
      [4, 3],
      [3, 3],
    ];
    expect(coordinatesContainCoordinates(outer, inner)).toBe(false);
  });

  test('convertRingsToGeoJSON should convert rings to GeoJSON Polygon', () => {
    const rings: Ring[] = [
      [
        [0, 0],
        [0, 2],
        [2, 2],
        [2, 0],
        [0, 0],
      ],
    ];
    const geojson = convertRingsToGeoJSON(rings);
    expect(geojson).toEqual({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0, 2],
          [2, 2],
          [2, 0],
          [0, 0],
        ],
      ],
    });
  });

  test('orientRings should orient rings correctly', () => {
    const rings: Ring[] = [
      [
        [0, 0],
        [0, 2],
        [2, 2],
        [2, 0],
        [0, 0],
      ],
      [
        [1, 1],
        [1, 1.5],
        [1.5, 1.5],
        [1.5, 1],
        [1, 1],
      ],
    ];
    const oriented = orientRings(rings);
    expect(oriented).toEqual([
      [
        [0, 0],
        [0, 2],
        [2, 2],
        [2, 0],
        [0, 0],
      ],
      [
        [1, 1],
        [1.5, 1],
        [1.5, 1.5],
        [1, 1.5],
        [1, 1],
      ],
    ]);
  });

  test('flattenMultiPolygonRings should flatten multi-polygon rings', () => {
    const rings: MultiPolygon = [
      [
        [
          [0, 0],
          [0, 2],
          [2, 2],
          [2, 0],
          [0, 0],
        ],
      ],
      [
        [
          [3, 3],
          [3, 4],
          [4, 4],
          [4, 3],
          [3, 3],
        ],
      ],
    ];
    const flattened = flattenMultiPolygonRings(rings);
    expect(flattened).toEqual([
      [
        [0, 0],
        [0, 2],
        [2, 2],
        [2, 0],
        [0, 0],
      ],
      [
        [3, 3],
        [3, 4],
        [4, 4],
        [4, 3],
        [3, 3],
      ],
    ]);
  });

  test('shallowClone should create a shallow clone of an object', () => {
    const obj = { a: 1, b: 2 };
    const clone = shallowClone(obj);
    expect(clone).toEqual(obj);
    expect(clone).not.toBe(obj);
  });

  test('arcgisToGeoJSON should convert ArcGIS point to GeoJSON point', () => {
    const arcgis = { x: 1, y: 2 };
    const geojson = arcgisToGeoJSON(arcgis);
    expect(geojson).toEqual({
      type: 'Point',
      coordinates: [1, 2],
    });
  });

  test('geojsonToArcGIS should convert GeoJSON point to ArcGIS point', () => {
    const geojson = { type: 'Point', coordinates: [1, 2] };
    const arcgis = geojsonToArcGIS(geojson);
    expect(arcgis).toEqual({
      x: 1,
      y: 2,
      spatialReference: { wkid: 4326 },
    });
  });
});
