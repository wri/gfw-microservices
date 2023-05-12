import {
  appendListConfig,
  copyListConfig,
  moveListConfig,
  saveAsDraftListConfig,
  saveListConfig,
} from '../../../../config/config/locations.config';

/**
 * Get Dialog Title
 *
 * @param {string} responseMessages - Response Messages
 * @param {number} numberOfLocations - Number of selected Locations
 * @return {string} - Dialog Title
 */
export function getDialogTitle(responseMessages, numberOfLocations = 1) {
  let dialogTitle;

  if (numberOfLocations === 1) {
    if (responseMessages === appendListConfig.success) {
      dialogTitle = appendListConfig.UploadLocationsSingleAppendToExisting.dialogTitle;
    } else if (responseMessages === copyListConfig.success) {
      dialogTitle = copyListConfig.UploadLocationsSingleCopyToExisting.dialogTitle;
    } else if (responseMessages === saveListConfig.success) {
      dialogTitle = saveListConfig.UploadLocationsSingleNewList.dialogTitle;
    } else if (responseMessages === moveListConfig.success) {
      dialogTitle = moveListConfig.UploadLocationsSingleNewList.dialogTitle;
    } else if (responseMessages === saveAsDraftListConfig.success) {
      dialogTitle = saveAsDraftListConfig.UploadLocationsSingleNewList.dialogTitle;
    }
  } else {
    if (responseMessages === appendListConfig.success) {
      dialogTitle = appendListConfig.UploadLocationsMultipleAppendToExisting.dialogTitle;
    } else if (responseMessages === copyListConfig.success) {
      dialogTitle = copyListConfig.UploadLocationsMultipleCopyToExisting.dialogTitle;
    } else if (responseMessages === saveListConfig.success) {
      dialogTitle = saveListConfig.UploadLocationsMultipleNewList.dialogTitle;
    } else if (responseMessages === moveListConfig.success) {
      dialogTitle = moveListConfig.UploadLocationsMultipleNewList.dialogTitle;
    } else if (responseMessages === saveAsDraftListConfig.success) {
      dialogTitle = saveAsDraftListConfig.UploadLocationsMultipleNewList.dialogTitle;
    }
  }

  return dialogTitle;
}

/**
 * Get Dialog Content
 *
 * @param {string} responseMessages - Response Messages
 * @param {string} destinationListName - Destination List Name
 * @param {boolean} isSaveAsDraft - Save As Draft list [TRUE/FALSE]
 * @param {number} numberOfLocations - Number of selected Locations
 * @return {string} - Dialog Content
 */
export function getDialogContent(responseMessages, destinationListName, isSaveAsDraft = false, numberOfLocations = 1) {
  let dialogContent;

  if (numberOfLocations === 1) {
    if (responseMessages === appendListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? appendListConfig.UploadLocationsSingleAppendToExisting.dialogMessage(destinationListName)
        : appendListConfig.UploadLocationsSingleAppendToExisting.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === copyListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? copyListConfig.UploadLocationsSingleCopyToExisting.dialogMessage(destinationListName)
        : copyListConfig.UploadLocationsSingleCopyToExisting.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === saveListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? saveListConfig.UploadLocationsSingleNewList.dialogMessage(destinationListName)
        : saveListConfig.UploadLocationsSingleNewList.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === moveListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? moveListConfig.UploadLocationsSingleNewList.dialogMessage(destinationListName)
        : moveListConfig.UploadLocationsSingleNewList.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === saveAsDraftListConfig.success) {
      dialogContent = saveAsDraftListConfig.UploadLocationsSingleNewList.dialogMessage(destinationListName);
    }
  } else {
    if (responseMessages === appendListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? appendListConfig.UploadLocationsMultipleAppendToExisting.dialogMessage(destinationListName)
        : appendListConfig.UploadLocationsMultipleAppendToExisting.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === copyListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? copyListConfig.UploadLocationsMultipleCopyToExisting.dialogMessage(destinationListName)
        : copyListConfig.UploadLocationsMultipleCopyToExisting.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === saveListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? saveListConfig.UploadLocationsMultipleNewList.dialogMessage(destinationListName)
        : saveListConfig.UploadLocationsMultipleNewList.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === moveListConfig.success) {
      dialogContent = !isSaveAsDraft
        ? moveListConfig.UploadLocationsMultipleNewList.dialogMessage(destinationListName)
        : moveListConfig.UploadLocationsMultipleNewList.saveAsDraft.dialogMessage(destinationListName);
    } else if (responseMessages === saveAsDraftListConfig.success) {
      dialogContent = saveAsDraftListConfig.UploadLocationsMultipleNewList.dialogMessage(destinationListName);
    }
  }

  return dialogContent;
}
