//Default Language Index.
const defaultLanguageID = 'en';

//Language Strings.
const langResources = {
  en: {
    userisNotAnAdmin: 'User is not an Administrator.',
    userExistInOrg: 'User is already registered in this organization.',
    loginFailed: 'Incorrect username or password. Please try again.',
    accountDisabled: 'User has been disabled. Please reset your password.',
    InvalidSession: 'Invalid Session. Please login.',
    verificationFailed: 'Validation failed for the verification code.',
    AuthenticationFailure: 'Critical error in authentication, please contact support.',
    invaidInitialPasswordChange: 'User does not require an initial password change.',
    criticalError: 'Critical Error! Please contact your local IT Administrator.',
    executeSystemStoredProcedure: 'Failed to execute system stored procedure in database.',
    executeOrganizationStoredProcedure: 'Failed to execute organization stored procedure in database.',
    failedToAuthenticate: 'Failed to authenticate user.',
    failedToSendEmail: 'Failed to send email.',
    failedSQLConnection: 'Failure to connect to SQL server',
    invalidEmail: 'User does not exist in the organization.',
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
    missingDestinationFolderId: 'Please make sure to include the desination folder ID in the request.',
  },
};

function getResourceStringOLD(resource_id, language_id) {
  console.log('Resource ID: ', resource_id);
  console.log('Language ID: ', language_id);

  //Check if the resource id is undefined or empty
  if (resource_id === undefined || resource_id.length === 0) {
    return '';
  }
  //Check if the language ID passed is not valid.
  else if (language_id === undefined || language_id.length === 0) {
    language_id = defaultLanguageID;
  }

  console.log('Resource ID: ', resource_id);
  console.log('Language ID: ', language_id);

  try {
    //Check if the resource is available in the language requested.
    if (langResources[language_id][resource_id] !== 'undefined') {
      return langResources[language_id][resource_id];
    } else if (langResources[defaultLanguageID][resource_id] !== 'undefined') {
      return langResources[defaultLanguageID][resource_id];
    } else {
      return '';
    }
  } catch (err) {
    console.log('ERROR: ', err);
  }
}

function getResourceString(resource_id) {
  //Check if the resource id is undefined or empty
  if (resource_id === undefined || resource_id.length === 0) {
    return '';
  }

  try {
    //Check if the resource is available in the language requested.
    if (langResources[defaultLanguageID][resource_id] !== 'undefined') {
      return langResources[defaultLanguageID][resource_id];
    } else {
      return '';
    }
  } catch (err) {
    console.log('ERROR: ', err);
  }
}

//exporting the functions.
module.exports = {
  getResourceString: getResourceString,
  getResourceStringOLD: getResourceStringOLD,
  defaultLanguageID: defaultLanguageID,
};
