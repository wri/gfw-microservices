import { Logger } from '@nestjs/common';
import {
  handleCreateAnalysis,
  PerformCopyAnalysis,
  PerformLocationsBulkCopy,
  UnlockLists,
} from '@wri-monorepos/geo';
import { UnlockListAndSaveAsDraft, UspSetListLocked } from '@wri-monorepos/sql';

const logger = new Logger(`handleExistingListUpdate`);

export const handleExistingListUpdate = async ({
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
}) => {
  // Lists to be unlocked after the process
  const unlock = [];

  await new UspSetListLocked().run(clientDatabase, selectedListId, userId);
  unlock.push(selectedListId);
  await new UspSetListLocked().run(clientDatabase, moveToList.id, userId);
  unlock.push(moveToList.id);

  logger.log(`Performing ${action} for existing list`);
  const destLocationIds = await PerformLocationsBulkCopy(
    moveToList.id,
    moveToList.list_name,
    false,
    finalGeojson,
    commodityType,
    clientDatabase
  );

  logger.log(`Copy location analysis for existing list`);
  await PerformCopyAnalysis(
    clientDatabase,
    srcListAnalysisTable,
    selectedListId,
    moveToList.id,
    selectedLocations,
    destLocationIds
  );

  if (isSaveAsDraft) {
    await UnlockListAndSaveAsDraft(clientDatabase, moveToList.id, gfwListId);
  } else {
    await handleProcessingLimits({
      clientDatabase,
      organizationId,
      subscriptionStatusId,
      listId: moveToList.id,
      userId,
      analysisIds,
    });
  }

  if (unlock.length > 0) {
    await UnlockLists(clientDatabase, unlock);
    logger.log(`Lists unlocked: ${unlock.join()}`, 'LocationsService');
  }
};

const handleProcessingLimits = async ({
  clientDatabase,
  organizationId,
  subscriptionStatusId,
  listId,
  userId,
  analysisIds,
}) => {
  const analysisTypesToProcess = analysisIds.join(',');
  const result = await handleCreateAnalysis(
    analysisTypesToProcess,
    listId,
    organizationId,
    clientDatabase,
    false,
    userId,
    subscriptionStatusId,
    false
  );

  if (result !== 'OK' && result !== 'Created') {
    throw new Error(`Failed to start analysis: ${result}`);
  }
};
