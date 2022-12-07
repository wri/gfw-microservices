import { UspUpdateListCount } from './uspUpdateListCount';
import { UspDeleteLocation } from './uspDeleteLocation';
import { UspGetAnalysisColumns } from './uspGetAnalysisColumns';
import { ListBulkCopy } from './ListBulkCopy';
import { CreateListResult, SPSListCreation } from './listCreation';
import { UspGetListLocations } from './uspGetListLocations';
import { UspGetListLockStatus } from './uspGetListLockStatus';
import { UspCopyLocationAnalysis } from './uspCopyLocationAnalysis';
import { UspGetListNameSchema } from '../llp/uspGetListNameSchema';
import { UspSetListUnlocked } from './uspSetListUnlocked';
import { UspResetListStatus } from './uspResetListStatus';
import { UspDeleteList } from './uspDeleteList';

const DEFAULT_ROWS_REQUESTED = 200000;
const ListStatus = {
  Pending: 1,
  Active: 2,
  Inactive: 3,
  Draft: 4,
  AnalyzingDiagnostic: 5,
  AnalyzingDashboard: 6,
};

export const GetListLocations = (clientDatabase, listId, locationId) => {
  const uspListLocations = new UspGetListLocations();
  const details = {
    listID: listId,
    locationID: locationId,
    rowsRequested: DEFAULT_ROWS_REQUESTED,
  };
  return uspListLocations.run(clientDatabase, details);
};

export const CreateNewUserList = (
  listName: string,
  templateId: number,
  locationClassification: string,
  userId: number,
  customAttributes: string[],
  clientDatabase: string,
  gfwListId?: number
): Promise<CreateListResult> => {
  const listCreation = new SPSListCreation();
  return listCreation.createNewList(
    listName,
    templateId,
    locationClassification,
    userId,
    customAttributes,
    clientDatabase,
    gfwListId
  );
};

export const PerformListBulkCopy = (
  listId,
  listName,
  createTable,
  finalGeojson,
  commodityType,
  clientDatabase
) => {
  const bulkcopy = new ListBulkCopy();
  return bulkcopy.uploadBulkLocations(
    listId,
    listName,
    createTable,
    finalGeojson,
    commodityType,
    clientDatabase
  );
};

export const PerformGetLockStatus = (clientDatabase, listId) => {
  const listLocationStatus = new UspGetListLockStatus();
  return listLocationStatus.run(clientDatabase, {
    list_id: listId,
  });
};

export const GetTableAnalysisColumnsById = (clientDatabase, listId) => {
  const listLocationStatus = new UspGetAnalysisColumns();

  return listLocationStatus.run(clientDatabase, {
    listId: listId,
  });
};

export const CopySingleLocationAnalysis = (
  srcListId,
  desListId,
  srcLocationId,
  destLocationId,
  statement,
  clientDatabase
) => {
  const listLocationStatus = new UspCopyLocationAnalysis();
  return listLocationStatus.run(clientDatabase, {
    desListId,
    destLocationId,
    srcListId,
    srcLocationId,
    statement,
  });
};

/** @function {DeleteLocations}
 *   @summary Deletes locations from a list
 *   @param {Number} list_id
 *   @param {Array} locationIds
 *   @param  {Number} gfwListId
 *   @return {Promise}
 */
export const DeleteLocations = (
  databaseName,
  listId,
  locationIds,
  userId,
  gfwListId
) => {
  let promiseResolver = Promise.resolve();
  return new Promise((resolve, reject) => {
    // Important variables
    let list;
    new UspGetListLockStatus()
      .run(databaseName, {
        list_id: listId,
      })
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // 1. List is unlocked
        if (
          lock_status === null ||
          (lock_status !== null && lock_user_id !== userId)
        ) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          return new UspGetListNameSchema().run(databaseName, {
            listID: listId,
          });
        }
      })
      .then((record) => {
        // 2. Deleting list locations
        list = record;
        locationIds.forEach((locationId) => {
          promiseResolver = promiseResolver.then(() => {
            return new UspDeleteLocation().run(
              databaseName,
              list.id,
              locationId
            );
          });
        });
        return promiseResolver;
      })
      .then(() => {
        // 3. Update list count of deleted location
        return new UspUpdateListCount().run(
          databaseName,
          list.list_table,
          list.id
        );
      })
      .then(() => {
        // 4. Unlock list to allow further interaction
        return new UspSetListUnlocked().run(databaseName, listId);
      })
      .then(async () => {
        // 5. Set list status to DRAFT
        await new UspResetListStatus().run(
          databaseName,
          listId,
          ListStatus.Draft,
          gfwListId
        );
        /*logger.logActivity(
          req,
          logger.listActivityTypes.List.LocationDeletedFromList,
          `Locations with IDs (${location_ids}) deleted from (${list.list_name})`
        );*/
        resolve(true);
      })
      .catch((err) => {
        console.log('Error in deleting location', err);
        /*const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteList,
          `Failed to delete locations from list id ${list_id}`,
          err
        );*/
        //reject(errorObject);
        reject(err);
      });
  });
};

/** @function {DeleteLocations}
 *   @summary Deletes locations from a list
 *   @param {Number} list_id
 *   @param {Array} locationIds
 *   @param  {Number} gfwListId
 *   @return {Promise}
 */
export const DeleteList = (databaseName, listId, userId) => {
  return new Promise((resolve, reject) => {
    // Important variables
    let list; // used to logger
    new UspGetListLockStatus()
      .run(databaseName, {
        list_id: listId,
      })
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // 1. List is unlocked
        if (
          lock_status === null ||
          (lock_status !== null && lock_user_id !== userId)
        ) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          return new UspGetListNameSchema().run(databaseName, {
            listID: listId,
          });
        }
      })
      .then((record) => {
        // 2. Deleting list locations
        list = record;
        new UspDeleteList().run(
          databaseName,
          record.list_name,
          record.list_table_name,
          record.list_analysis_table_name
        );
      })
      .catch((err) => {
        console.log('Error in deleting location', err);
        /*const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToDeleteList,
          `Failed to delete locations from list id ${list_id}`,
          err
        );*/
        //reject(errorObject);
        reject(err);
      });
  });
};
