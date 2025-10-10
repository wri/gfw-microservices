import { Feature, FeatureCollection } from '@wri-monorepos/geo';
import { MAX_LOCATIONS_PER_LIST } from './constants';
import { ListSizeLimitException } from './listSizeLimit.exception';
import { getListLocationsCountById } from '@wri-monorepos/sql';
export const checkListSizeLimit = async (
  clientDatabase: string,
  listId: number,
  finalGeojson: FeatureCollection | Feature[]
) => {
  const existingCount = (await getListLocationsCountById(listId, clientDatabase)) || 0;
  const incomingCount = Array.isArray(finalGeojson)
    ? finalGeojson.length
    : finalGeojson?.features?.length ?? 0;
  if (existingCount + incomingCount > MAX_LOCATIONS_PER_LIST) {
    throw new ListSizeLimitException(MAX_LOCATIONS_PER_LIST);
  }
};
