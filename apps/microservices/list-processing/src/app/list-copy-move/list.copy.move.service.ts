import { Injectable, Logger } from '@nestjs/common';
import { CopyOrMoveLargeListRequestLLP } from '../../models';
import {
  ActionType,
  TargetListType,
  upgradeListSchema,
  UspGetLocationsFilteredToCopy,
  UspSetListLocked,
} from '@wri-monorepos/sql';
import { CheckListNameIsValid } from '@wri-monorepos/geo';
import { SetListDraftStatus } from './shared/put.list.as.draft';

@Injectable()
export class ListCopyMoveService {
  private readonly logger = new Logger(ListCopyMoveService.name);
  async run(request: CopyOrMoveLargeListRequestLLP) {
    // Lists to be unlocked after the process
    const unlock = [];
    this.logger.log('Starting list copy/move flow');
    const {
      listId: selectedListId,
      selectedListLocationClassification,
      customAttributesNames,
      userListNames,
      action,
      listType,
      listName: newListName,
      targetList: moveToList,
      selectedLocations,
      addType,
      // activeTemplate,
      commodityType,
      templateData,
      saveAsDraft: isSaveAsDraft,
      userId,
      clientDatabase,
      organizationId,
      subscriptionStatusId,
      gfwListId,
      allLocationsSelected = false,
      filters,
      srcListAnalysisTable,
    } = request;

    // Upgrade the list schema to the latest version
    await upgradeListSchema({
      clientDb: clientDatabase,
      listId: selectedListId,
      userId: userId,
    });
    await new UspSetListLocked().run(clientDatabase, selectedListId, userId);
    unlock.push(selectedListId);

    if (listType !== TargetListType.New) {
      this.logger.log('Copy/Move to an existing list');
      await upgradeListSchema({
        clientDb: clientDatabase,
        listId: moveToList.id,
        userId: userId,
      });
      await new UspSetListLocked().run(clientDatabase, moveToList.id, userId);
      unlock.push(moveToList.id);
    }

    const listName = listType === TargetListType.New ? newListName : moveToList?.list_name;
    CheckListNameIsValid(listType, listName, userListNames);

    this.logger.log('Gathering information for locations');

    if (action === ActionType.Move) {
      this.logger.log(
        `Changing source list (${selectedListId}) status to draft because locations will be moved`
      );
      await SetListDraftStatus(clientDatabase, selectedListId, gfwListId);
    }

    // Lock the source and target lists
    const locationData = await new UspGetLocationsFilteredToCopy().run(clientDatabase, {
      listID: selectedListId,
      selectedLocations: allLocationsSelected ? null : selectedLocations.join(),
      country: filters.country,
      state: filters.state,
      subState: filters.subState,
      analysisAreaMin: filters.analysisAreaMin,
      analysisAreaMax: filters.analysisAreaMax,
      searchString: filters.searchString,
    });

    if (listType === TargetListType.New) {
      await handleNewListCreation();
    } else {
      await handleExistingListUpdate();
    }

    if (action === ActionType.Move) {
      await handleSourceListDeletion();
    }

    return {
      success: true,
      action,
    };
  }
}
