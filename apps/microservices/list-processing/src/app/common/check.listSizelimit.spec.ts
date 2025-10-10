import { FeatureCollection, Feature, Point } from '@wri-monorepos/geo';
import { getListLocationsCountById } from '@wri-monorepos/sql';
import { MAX_LOCATIONS_PER_LIST } from './constants';
import { checkListSizeLimit } from './check.listSizelimit';
import { ListSizeLimitException } from './listSizeLimit.exception';

jest.mock('@wri-monorepos/sql', () => ({
  getListLocationsCountById: jest.fn(),
}));

const mockGetListLocationsCountById = getListLocationsCountById as jest.Mock;

describe('checkListSizeLimit', () => {
  const clientDatabase = 'test-db';
  const listId = 42;

  const createPointGeometry = (): Point => ({
    type: 'Point',
    coordinates: [0, 0],
  });

  const createFeature = (): Feature => ({
    type: 'Feature',
    geometry: createPointGeometry(),
    properties: {},
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws ListSizeLimitException when existing + incoming exceed the limit', async () => {
    mockGetListLocationsCountById.mockResolvedValue(MAX_LOCATIONS_PER_LIST);
    const incomingFeature: FeatureCollection = {
      type: 'FeatureCollection',
      features: [createFeature()],
    };

    await expect(
      checkListSizeLimit(clientDatabase, listId, incomingFeature)
    ).rejects.toBeInstanceOf(ListSizeLimitException);
  });

  it('resolves when combined size stays within the limit and queries existing count', async () => {
    mockGetListLocationsCountById.mockResolvedValue(10);
    const incomingFeature: FeatureCollection = {
      type: 'FeatureCollection',
      features: Array.from({ length: MAX_LOCATIONS_PER_LIST - 10 }, () => createFeature()),
    };

    await expect(
      checkListSizeLimit(clientDatabase, listId, incomingFeature)
    ).resolves.toBeUndefined();

    expect(mockGetListLocationsCountById).toHaveBeenCalledWith(listId, clientDatabase);
  });
});
