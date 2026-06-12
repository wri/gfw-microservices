import { Logger } from '@nestjs/common';
import { BulkDeleteLocations, DeleteList, UspSetListLocked } from '@wri-monorepos/sql';
import { ListHasFiltersApplies } from '@wri-monorepos/geo';
import { PutListAsDraft } from '../../list-upload/chain/put.list.as.draft';

const logger = new Logger('handleSourceListDeletion');

type HandleSourceListDeletionParams = {
  clientDatabase: string;
  selectedListId: number;
  userId: number;
  gfwListId: number;
  allLocationsSelected: boolean;
  filters: {
    country?: string;
    state?: string;
    subState?: string;
    analysisAreaMin?: number;
    searchString?: string;
  };
  selectedLocations: unknown[];
  putListAsDraft: PutListAsDraft;
};

export const handleSourceListDeletion = async ({
  clientDatabase,
  selectedListId,
  userId,
  gfwListId,
  allLocationsSelected,
  filters,
  selectedLocations,
  putListAsDraft,
}: HandleSourceListDeletionParams) => {
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
      allLocationsSelected ? null : selectedLocations.join()
    );
    await putListAsDraft.putListAsDraft(clientDatabase, selectedListId, gfwListId);
  }
};
