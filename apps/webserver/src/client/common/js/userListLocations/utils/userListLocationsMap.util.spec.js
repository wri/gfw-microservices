jest.mock('@arcgis/core/geometry/geometryEngine', () => ({
  geodesicBuffer: jest.fn().mockImplementation((point) => ({
    extent: {
      xmin: point.longitude - 0.01,
      xmax: point.longitude + 0.01,
      ymin: point.latitude - 0.01,
      ymax: point.latitude + 0.01,
    },
  })),
}));

const {
  normalizeUserListBounds,
  getExtentFromLocationPoints,
} = require('./userListLocationsMap.util');

describe('getExtentFromLocationPoints', () => {
  test('returns null when no points are given', () => {
    expect(getExtentFromLocationPoints([])).toBeNull();
    expect(getExtentFromLocationPoints(undefined)).toBeNull();
  });

  test('buffers a single point into a small extent around it', () => {
    const extent = getExtentFromLocationPoints([{ latitude: 10, longitude: 20 }]);

    expect(extent.xmin).toBeLessThan(20);
    expect(extent.xmax).toBeGreaterThan(20);
    expect(extent.ymin).toBeLessThan(10);
    expect(extent.ymax).toBeGreaterThan(10);
  });

  test('builds a padded extent covering multiple points', () => {
    const extent = getExtentFromLocationPoints([
      { latitude: 10, longitude: 20 },
      { latitude: 12, longitude: 22 },
    ]);

    expect(extent.xmin).toBeLessThanOrEqual(20);
    expect(extent.xmax).toBeGreaterThanOrEqual(22);
    expect(extent.ymin).toBeLessThanOrEqual(10);
    expect(extent.ymax).toBeGreaterThanOrEqual(12);
    expect(extent.expand).toHaveBeenCalledWith(1.2);
  });
});

describe('normalizeUserListBounds', () => {
  test('accepts a numeric bounds object from MBTiles metadata', () => {
    const bounds = { xmin: -180, ymin: -90, xmax: 180, ymax: 90 };

    const normalized = normalizeUserListBounds(bounds);

    expect(normalized).toEqual({ xmin: -180, ymin: -90, xmax: 180, ymax: 90 });
  });

  test('accepts a comma-delimited bounds string', () => {
    const normalized = normalizeUserListBounds('-180,-90,180,90');

    expect(normalized).toEqual({ xmin: -180, ymin: -90, xmax: 180, ymax: 90 });
  });

  test('returns null when bounds are missing', () => {
    const normalized = normalizeUserListBounds();

    expect(normalized).toBeNull();
  });
});
