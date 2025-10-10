import { Logger } from '@nestjs/common';
import {
  FeatureCollection,
  handleCreateAnalysis,
  PerformCopyAnalysis,
  PerformLocationsBulkCopy,
  UnlockLists,
} from '@wri-monorepos/geo';
import { UnlockListAndSaveAsDraft, UspSetListLocked } from '@wri-monorepos/sql';
import { checkListSizeLimit } from '../../common/check.listSizelimit';

const logger = new Logger(`handleExistingListUpdate`);

interface ListUpdateParams {
  clientDatabase: string;
  selectedListId: number;
  moveToList: {
    id: number;
    list_name: string;
  };
  userId: number;
  action: string;
  isSaveAsDraft: boolean;
  finalGeojson: FeatureCollection;
  commodityType: string;
  srcListAnalysisTable: string;
  selectedLocations: number[];
  gfwListId: number;
  organizationId: number;
  analysisIds: string[];
  subscriptionStatusId: number;
}

const validateInput = (params: ListUpdateParams) => {
  if (!params.selectedListId || !params.moveToList?.id) {
    throw new Error('Invalid list IDs provided');
  }
  if (!params.userId) {
    throw new Error('User ID is required');
  }
  if (!params.finalGeojson) {
    throw new Error('Geojson data is required');
  }
};

const lockLists = async (clientDatabase: string, listIds: number[], userId: number) => {
  for (const listId of listIds) {
    await new UspSetListLocked().run(clientDatabase, listId, userId);
  }
};

export const handleExistingListUpdate = async (params: ListUpdateParams) => {
  const {
    clientDatabase,
    selectedListId,
    moveToList,
    userId,
    action,
    isSaveAsDraft,
    finalGeojson,
    commodityType,
    srcListAnalysisTable,
    selectedLocations,
    gfwListId,
    organizationId,
    analysisIds,
    subscriptionStatusId,
  } = params;

  const isGFWList = Boolean(gfwListId);

  validateInput(params);

  // Lists to be unlocked after the process
  const listsToUnlock = [selectedListId, moveToList.id];

  try {
    logger.log(`Starting ${action} process for list ${selectedListId} to ${moveToList.id}`);

    await lockLists(clientDatabase, listsToUnlock, userId);

    logger.log(`Performing ${action} for existing list`);
    // Enforce per-list size limit before bulk copy

    await checkListSizeLimit(clientDatabase, moveToList.id, finalGeojson);

    const destLocationIds = await PerformLocationsBulkCopy(
      moveToList.id,
      moveToList.list_name,
      false,
      finalGeojson,
      commodityType,
      clientDatabase
    );

    logger.log(`Copying location analysis for existing list`);
    await PerformCopyAnalysis(
      clientDatabase,
      srcListAnalysisTable,
      selectedListId,
      moveToList.id,
      selectedLocations,
      destLocationIds,
      isGFWList
    );

    if (isSaveAsDraft) {
      logger.log(`Saving list ${moveToList.id} as draft`);
      await UnlockListAndSaveAsDraft(clientDatabase, moveToList.id, gfwListId);
    } else {
      logger.log(`Creating analysis for list ${moveToList.id}`);
      const analysisTypesToProcess = analysisIds.join(',');
      const result = await handleCreateAnalysis(
        analysisTypesToProcess,
        moveToList.id,
        organizationId,
        clientDatabase,
        true,
        userId,
        subscriptionStatusId,
        false
      );

      if (result !== 'OK' && result !== 'Created') {
        throw new Error(`Failed to start analysis: ${result}`);
      }
    }

    logger.log(`Successfully completed ${action} process`);
  } catch (error) {
    logger.error(`Error during ${action} process: ${error.message}`, error.stack);
    throw error;
  } finally {
    if (listsToUnlock.length > 0) {
      logger.log(`Unlocking lists: ${listsToUnlock.join(', ')}`);
      await UnlockLists(clientDatabase, listsToUnlock);
    }
  }
};
