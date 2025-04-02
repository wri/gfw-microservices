import { Logger } from '@nestjs/common';
import { BulkDeleteLocations, DeleteList, UspSetListLocked } from '@wri-monorepos/sql';
import { SetListDraftStatus } from '../shared/put.list.as.draft';
import { ListHasFiltersApplies } from '@wri-monorepos/geo';

const logger = new Logger('handleSourceListDeletion');

export const handleSourceListDeletion = async ({
  clientDatabase,
  selectedListId,
  userId,
  gfwListId,
  allLocationsSelected,
  filters,
  selectedLocations,
}) => {
  logger.log('Checking if source list needs to be deleted when move action is selected');
  await new UspSetListLocked().run(clientDatabase, selectedListId, userId);

  if (allLocationsSelected && !ListHasFiltersApplies(filters)) {
    logger.log(`Delete list ${selectedListId} because all locations were moved.`);
    await DeleteList(clientDatabase, selectedListId, userId);
  } else {
    logger.log(
      `Deleting selected locations from source list ${selectedListId}, locations: ${selectedLocations.join()}.`
    );
    await BulkDeleteLocations(
      clientDatabase,
      selectedListId,
      userId,
      gfwListId,
      allLocationsSelected ? null : selectedLocations.join(),
      filters.country,
      filters.state,
      filters.subState,
      filters.analysisAreaMin,
      filters.analysisAreaMax,
      filters.searchString
    );
    await SetListDraftStatus(clientDatabase, selectedListId, gfwListId);
  }
};
