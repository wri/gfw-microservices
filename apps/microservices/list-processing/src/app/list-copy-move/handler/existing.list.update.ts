import { Logger } from '@nestjs/common';
import { listStatus } from '@wri-monorepos/constants';
import {
  getAnalysisTypesFromIds,
  PerformCopyAnalysis,
  PerformLocationsBulkCopy,
  UnlockLists,
} from '@wri-monorepos/geo';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import {
  requestAnalysisProcess,
  UnlockListAndSaveAsDraft,
  updateListsAnalysisStatus,
  UspSetListLocked,
} from '@wri-monorepos/sql';
import { ProcessingLimitException } from '../../app.exceptions';

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
  const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
    organizationDb: clientDatabase,
    organizationId,
    subscriptionStatusId,
    listId,
  });

  if (isListLocationOverLimit) {
    await updateListsAnalysisStatus(clientDatabase, {
      listId,
      errorInfo: 'Exceeded Analysis Limit',
      status: listStatus.Inactive,
    });
    throw new ProcessingLimitException();
  }
  const analysis_types = getAnalysisTypesFromIds(analysisIds);
  const postData = {
    list_id: listId,
    user_id: userId,
    organization_id: organizationId,
    reanalyze: false,
    processing_limit: processingLimit,
    analysis_types,
  };
  const analysisUrl = process.env.AWS_ANALYSIS_LAMBDA_URL;
  const analysisRequestResponse = await requestAnalysisProcess(analysisUrl, postData);
  const jsonResponse = await analysisRequestResponse.json();
  logger.log(`Analysis request response: ${JSON.stringify(jsonResponse)}`);
};
