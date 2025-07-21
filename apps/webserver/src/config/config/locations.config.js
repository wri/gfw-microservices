const moveListConfig = {
  success: 'LocationMoved',
  UploadLocationsSingleNewList: {
    dialogTitle: 'Location Moved',
    dialogMessage(listName) {
      return `You have successfully moved your location to list ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully moved location and saved ${listName} as a draft`;
      },
    },
  },
  UploadLocationsMultipleNewList: {
    dialogTitle: 'Locations Moved',
    dialogMessage(listName) {
      return `You have successfully moved your locations to list ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully moved locations and saved ${listName} as a draft`;
      },
    },
  },
};

const saveListConfig = {
  success: 'LocationAdded',
  UploadLocationsSingleNewList: {
    dialogTitle: 'Location Added',
    dialogMessage(listName) {
      return `You have successfully uploaded your location to list ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully added location and saved ${listName} as a draft`;
      },
    },
  },
  UploadLocationsMultipleNewList: {
    dialogTitle: 'Locations Added',
    dialogMessage(listName) {
      return `You have successfully uploaded your locations to list ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully added locations and saved ${listName} as a draft`;
      },
    },
  },
};

const appendListConfig = {
  success: 'LocationAppended',
  UploadLocationsSingleAppendToExisting: {
    dialogTitle: 'Location Added',
    dialogMessage(listName) {
      return `You have successfully added location to ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully added location to ${listName} and saved as a draft`;
      },
    },
  },
  UploadLocationsMultipleAppendToExisting: {
    dialogTitle: 'Locations Added',
    dialogMessage(listName) {
      return `You have successfully added locations to ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully added locations to ${listName} and saved as a draft`;
      },
    },
  },
};

const copyListConfig = {
  success: 'LocationsCopied',
  UploadLocationsSingleCopyToExisting: {
    dialogTitle: 'Location Copied',
    dialogMessage(listName) {
      return `You have successfully copied location to ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully copied location to ${listName} and saved as a draft`;
      },
    },
  },
  UploadLocationsMultipleCopyToExisting: {
    dialogTitle: 'Locations Copied',
    dialogMessage(listName) {
      return `You have successfully copied locations to ${listName}`;
    },
    saveAsDraft: {
      dialogMessage(listName) {
        return `You have successfully copied locations to ${listName} and saved as a draft`;
      },
    },
  },
};

exports.GEO_TRELLIS_ANALYZE_LIST = {
  route: '/geoTrellisAnalyzeList',
};

exports.DEFAULT_LIST_LOCATIONS_ROWS_REQUESTED = 10000;

exports.saveListConfig = saveListConfig;
exports.appendListConfig = appendListConfig;
exports.copyListConfig = copyListConfig;
exports.moveListConfig = moveListConfig;
