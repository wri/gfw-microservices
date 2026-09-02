const { normalizeUserListBounds } = require('./userListLocationsMap.util');

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
