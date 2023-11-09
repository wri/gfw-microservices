const sql = require('mssql');
const path = require('path');
const langResources = require(path.resolve('./config/langResources'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));

/**
 * @summary Get all folders for a clientstore
 * @param   {Object} req The user request
 * @returns {Promise<any[]>}  Returns an array of objects containing the folder id, folder name, creation time,
 *                           last accessed time and an Array of list ids that are part of the folder.
 */
const getAllFolders = async (req) => {
  const parameters = [{ field: 'user_id', type: sql.Int, value: req.session.organization_user_id }];
  try {
    const [folders, folderItems] = await Promise.all([
      sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetFolders', parameters),
      sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetAllFolderItems', parameters),
    ]);

    folderItems.forEach((item) => {
      const idx = folders.findIndex((folder) => folder.id === item.folder_id);
      if (folders[idx].lists) {
        folders[idx].lists.push(item.list_id);
      } else {
        folders[idx].lists = [item.list_id];
      }
    });

    return folders;
  } catch (error) {
    const errMessage = langResources.getResourceString('failedToGetAllFolders');
    console.log(`${errMessage} ${error}`);
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.failedToGetAllFolders,
      errMessage,
      error
    );
  }
};

/**
 * @summary Gets folder details for a given folder
 * @param   {Object}  req The original request
 * @param   {Number}     folder_id The folder ID
 * @returns {Promise<any[]>}  Returns an array with an object containing all the necessary info for that folder ID:
 *                           the folder id, folder name, creation time,  last accessed time and an Array of list ids
 *                           that are part of the folder.
 */
const getFolderDetails = async (req, folder_id) => {
  const parameters = [
    { field: 'folder_id', type: sql.Int, value: folder_id },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];
  try {
    const [folder, folderItems] = await Promise.all([
      sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetFolder', parameters),
      sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetFolderItems', parameters),
    ]);

    // Flattening the folder items
    folder[0].lists = folderItems.map((folderItem) => folderItem.list_id);

    return folder;
  } catch (error) {
    if (error.number === 50005) {
      const errMessage = langResources.getResourceString('folderDoesNotExist');
      console.log(errMessage);
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.folderDoesNotExist,
        errMessage,
        error
      );
    } else {
      const errMessage = langResources.getResourceString('failedToGetFolderDetails');
      console.log(`Error fetching folder details: ${error}`);
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.failedToGetFolderDetails,
        errMessage,
        error
      );
    }
  }
};

/**
 * @summary Creates a new folder with the given folder name
 * @param {Object} req The original request
 * @param {String} folder_name The folder name to be created
 */
const createNewFolder = async (req, folder_name) => {
  const parameters = [
    { field: 'name', type: sql.NVarChar(200), value: folder_name },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];
  try {
    const newFolderResponse = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspCreateNewFolder',
      parameters
    );
    const { id: folder_id } = newFolderResponse[0];

    if (folder_id) {
      return await getFolderDetails(req, folder_id);
    } else {
      return [];
    }
  } catch (error) {
    if (error.message.indexOf('UQ_USERID_FOLDER_NAME') >= 0) {
      const errMessage = langResources.getResourceString('failedToCreateNewFolderExisting');
      console.log(`${errMessage}: ${error}`);
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.failedToCreateNewFolder,
        errMessage,
        error
      );
    } else {
      console.log(`Error creating a new folder: ${error}`);
      const errMessage = langResources.getResourceString('failedToCreateNewFolder');
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.failedToCreateNewFolder,
        errMessage,
        error
      );
    }
  }
};

/**
 * @summary Deletes an existing folder from the clientstore
 * @param {Object} req The original request
 * @param {Number} folder_id The folder ID
 */
const deleteFolder = async (req, folder_id) => {
  const parameters = [
    { field: 'folder_id', type: sql.Int, value: folder_id },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];
  try {
    const response = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspDeleteFolder',
      parameters
    );
    // Checking if at least one row was modified
    if (response[0].affected_rows) {
      return await getAllFolders(req);
    } else {
      throw `Error when trying to delete the folder with ID ${folder_id}. Make sure the folder exists.`;
    }
  } catch (error) {
    let errMessage;
    if (error.number === 50005) {
      errMessage = langResources.getResourceString('folderDoesNotExist');
    } else {
      errMessage = langResources.getResourceString('failedToDeleteFolder');
    }
    console.log(`errMessage: ${error}`);
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.failedToDeleteFolder,
      errMessage,
      error
    );
  }
};

/**
 * @summary Adds list(s) to a given folder
 * @param {Object} req The original request
 * @param {Number} folder_id The folder ID
 * @param {Array} list_ids The lists IDs to add to the folder
 */
const addListToFolder = async (req, folder_id, list_ids) => {
  const parameters = [
    { field: 'folder_id', type: sql.Int, value: folder_id },
    { field: 'list_ids', type: sql.NVarChar(sql.MAX), value: list_ids.join(',') },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];
  try {
    const response = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspAddListToFolder',
      parameters
    );
    // Checking if at least one row was modified
    if (response[0].affected_rows) {
      return await getAllFolders(req);
    } else {
      throw `Error when trying to add list(s) [${list_ids.join(',')}] to folder ID ${folder_id}.`;
    }
  } catch (error) {
    let errMessage;
    if (error.number === 50005) {
      errMessage = langResources.getResourceString('folderDoesNotExist');
    } else if (error.message.indexOf('FK_Folder_ID') >= 0) {
      errMessage = 'Some or all following lists might already be part of a folder.';
    } else if (error.message.indexOf('UQ_Folders_Lists') >= 0) {
      errMessage = 'Some or all of the lists IDs are already part of the folder.';
    } else if (error.message.indexOf('FK_List_ID') >= 0) {
      errMessage = 'Make sure the list ID(s) are correct and exists in the database.';
    } else if (error.message.indexOf('UQ_List') >= 0) {
      errMessage = 'Lists can only be added to one folder at a time!';
    } else {
      errMessage = 'Error while adding lists to the folder.';
    }
    console.log(
      `Error while adding lists IDs ${list_ids.join(
        ', '
      )} to the folder(id: ${folder_id}): ${error}`
    );
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.failedToAddListsToFolder,
      errMessage,
      error
    );
  }
};

/**
 * @summary Removes list(s) from a given folder
 * @param {Object} req The original request
 * @param {Number} folder_id   The folder ID
 * @param {Array}   list_ids    The list IDs to remove from the folder
 */
const removeListFromFolder = async (req, folder_id, list_ids) => {
  const parameters = [
    { field: 'folder_id', type: sql.Int, value: folder_id },
    { field: 'list_ids', type: sql.NVarChar(sql.MAX), value: list_ids.join(',') },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];
  try {
    return await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspRemoveListsFromFolder',
      parameters
    );
  } catch (error) {
    let errMessage;
    if (error.number === 50005) {
      errMessage = langResources.getResourceString('folderDoesNotExist');
    } else {
      console.log(`Error trying to remove list(s) from a folder: ${error}`);
    }
    console.log(errMessage);
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.folderDoesNotExist,
      errMessage,
      error
    );
  }
};

/**
 * @summary Renames a folder
 * @param {Object} req The original request
 * @param {Number} folder_id   The folder ID to rename
 * @param {String}   folder_name    The updated folder name
 */
const updateFolderName = async (req, folder_id, folder_name) => {
  const parameters = [
    { field: 'folder_id', type: sql.Int, value: folder_id },
    { field: 'folder_name', type: sql.NVarChar(200), value: folder_name },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];
  try {
    return await sqlUtils.executeOrganizationStoredProcedure(req, 'uspRenameFolder', parameters);
  } catch (error) {
    let errMessage;
    if (error.number === 50005) {
      errMessage = langResources.getResourceString('folderDoesNotExist');
    } else {
      console.log(`Error trying to remove list(s) from a folder: ${error}`);
    }
    console.log(errMessage);
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.folderDoesNotExist,
      errMessage,
      error
    );
  }
};

/**
 * @summary Moves lists from one folder to another
 * @param {Object} req The original request
 * @param {Number} from_folder_id The folder ID to copy lists out of
 * @param {Number} to_folder_id The folder ID to move lists in
 * @param {Array} list_ids The lists IDs to move
 */
const moveListToFolder = async (req, from_folder_id, to_folder_id, list_ids) => {
  const parameters = [
    { field: 'from_folder_id', type: sql.Int, value: from_folder_id },
    { field: 'to_folder_id', type: sql.Int, value: to_folder_id },
    { field: 'list_ids', type: sql.NVarChar(sql.MAX), value: list_ids.join(',') },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];

  try {
    const response = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspMoveListToFolder',
      parameters
    );
    // Checking if at least one row was modified
    if (response[0].affected_rows) {
      return await getAllFolders(req);
    } else {
      throw `Error while trying to move lists ${req.body.list_ids} from folder id ${from_folder_id} to folder id ${to_folder_id}. No rows were modified.`;
    }
  } catch (error) {
    let errMessage;
    if (error.number === 50005) {
      errMessage = langResources.getResourceString('folderDoesNotExist');
    } else {
      console.log(
        `Error while trying to move lists ${req.body.list_ids} from folder id ${from_folder_id} to folder id ${to_folder_id}`
      );
      errMessage = langResources.getResourceString('failedToAddListsToFolder');
    }
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.failedToAddListsToFolder,
      errMessage,
      error
    );
  }
};

/**
 * @summary Updates the last accessed time for a folder
 * @param {Object} req The original request
 * @param {Number} folder_id The folder ID
 */
const updateFolderAccessTime = async (req, folder_id) => {
  const parameters = [
    { field: 'folder_id', type: sql.Int, value: folder_id },
    { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
  ];

  try {
    await sqlUtils.executeOrganizationStoredProcedure(req, 'uspUpdateFolderAccessTime', parameters);
    return await getFolderDetails(req, folder_id);
  } catch (error) {
    let errMessage;
    // Throws an error if the given folder does not exist.
    if (error.number === 50005) {
      errMessage = langResources.getResourceString('folderDoesNotExist');
    } else {
      errMessage = langResources.getResourceString('failedToUpdateFolderAccessTime');
    }
    console.log(errMessage);
    throw new errorUtils.createErrorMessage(
      req,
      errorUtils.errorCodes.failedToUpdateFolderAccessTime,
      errMessage,
      error
    );
  }
};

module.exports = {
  getAllFolders,
  getFolderDetails,
  createNewFolder,
  deleteFolder,
  addListToFolder,
  removeListFromFolder,
  moveListToFolder,
  updateFolderAccessTime,
  updateFolderName,
};
