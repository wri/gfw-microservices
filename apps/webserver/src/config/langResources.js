// Default Language Index.
const defaultLanguageID = 'en';

// Language Strings.
const langResources = {
  en: {
    userIsNotAnAdmin: 'User is not an Administrator.',
    userExistsInOrg: 'User is already registered in this organization.',
    accountDisabled: 'User has been disabled. Please reset your password.',
    invalidSession: 'Invalid Session. Please login.',
    verificationFailed: 'Validation failed for the verification code.',
    authenticationFailure: 'Critical error in authentication, please contact support.',
    invalidInitialPasswordChange: 'User does not require an initial password change.',
    criticalError: 'Critical Error! Please contact your local IT Administrator.',
    executeSystemStoredProcedure: 'Failed to execute system stored procedure in database.',
    executeOrganizationStoredProcedure:
      'Failed to execute organization stored procedure in database.',
    failedToAuthenticate: 'Failed to authenticate user.',
    failedToSendEmail: 'Failed to send email.',
    failedSQLConnection: 'Failure to connect to SQL server',
    invalidUsernameOrPassword: 'Incorrect username or password. Please try again.',
    invalidEmail: 'User does not exist in the organization.',
    failedToSetInitialPassword: 'Failed to set initial password.',
    failedToConvertToWKT: 'Unable to convert GeoJSON geometry to WKT',
    failedToConvertToGeoJSON: 'Unable to convert WKT geometry to GeoJSON geometry',
    failedToDownloadFile: 'Unable to download policy',
    failedToGetAllFolders: 'Unable to fetch folders.',
    failedToGetFolderDetails: 'Unable to fetch folder details.',
    failedToCreateNewFolder: 'Failed to create a new folder.',
    failedToCreateNewFolderExisting: 'A folder with that name already exists.',
    failedToDeleteFolder: 'Failed to delete a folder. Please make sure the folder exists.',
    failedToAddListsToFolder: 'Failed to add list(s) to a folder.',
    failedToUpdateFolderAccessTime: "Failed to update folder's last access time.",
    userHasNoFolders: 'User has no folders.',
    folderDoesNotExist: 'The folder does not exist.',
    missingFolderId: 'Make sure to add a folder ID to the request.',
    missingListIds: 'Make sure to add list IDs to the request.',
    missingFolderName: 'Make sure to add a folder name to the request.',
    missingSourceFolderId: 'Please make sure to include the source folder ID in the request.',
    missingDestinationFolderId:
      'Please make sure to include the destination folder ID in the request.',
  },
};

function getResourceString(resource_id) {
  //Check if the resource id is undefined or empty
  if (!resource_id || !resource_id.length || !langResources[defaultLanguageID]?.[resource_id]) {
    return '';
  }

  try {
    // Check if the resource is available in the language requested.
    return langResources[defaultLanguageID][resource_id] || '';
  } catch (err) {
    console.log('ERROR: ', err);
  }
}

//exporting the functions.
module.exports = {
  getResourceString: getResourceString,
  defaultLanguageID: defaultLanguageID,
};
