import * as sql from 'mssql';
import { ClientStoreConnection, SQLUtils } from '../util';
import { ListNameSchema } from '../queries';
import { UspUpdateListCount } from './uspUpdateListCount';
import { UspDeleteLocation } from './uspDeleteLocation';
import { UspGetAnalysisColumns } from './uspGetAnalysisColumns';
import { UspGetListLocations } from './uspGetListLocations';
import { UspGetListLockStatus } from './uspGetListLockStatus';
import { UspCopyLocationAnalysis } from './uspCopyLocationAnalysis';
import { UspSetListUnlocked } from './uspSetListUnlocked';
import { UspResetListStatus } from './uspResetListStatus';
import { UspDeleteList } from './uspDeleteList';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UspDeleteLocationIdsFilteredDataForUserList } from './uspDeleteLocationIdsFilteredDataForUserList';
import { ActivityLog, List } from '../entity';
const logger = new Logger('ClientDatabaseOperationsManager');

const DEFAULT_ROWS_REQUESTED = 200000;
const ListStatus = {
  Pending: 1,
  Active: 2,
  Inactive: 3,
  Draft: 4,
  AnalyzingDiagnostic: 5,
  AnalyzingDashboard: 6,
};

/**
 * Not deprecated but not used anywhere
 */
export const GetListLocations = (clientDatabase, listId, locationId) => {
  const uspListLocations = new UspGetListLocations();
  const details = {
    listID: listId,
    locationID: locationId,
    rowsRequested: DEFAULT_ROWS_REQUESTED,
  };
  return uspListLocations.run(clientDatabase, details);
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

/**
 * Not deprecated yet but not used for now
 */
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
export const DeleteLocations = (databaseName, listId, locationIds, userId, gfwListId) => {
  let promiseResolver = Promise.resolve();
  return new Promise((resolve, reject) => {
    // Important variables
    let list: ListNameSchema;
    new UspGetListLockStatus()
      .run(databaseName, {
        list_id: listId,
      })
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // 1. List is unlocked
        if (lock_status === null || (lock_status !== null && lock_user_id !== userId)) {
          // Reject object
          logger.log(
            `List lock status is ${lock_status} and is locked by: ${lock_user_id} and current user is ${userId}`
          );
          throw { isLocked: true, lock_user_id };
        } else {
          const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
          return SQLUtils.queryDBFirstRow<ListNameSchema>(
            databaseName,
            'uspGetListNameSchema',
            parameters
          );
        }
      })
      .then((record) => {
        // 2. Deleting list locations
        list = record;
        locationIds.forEach((locationId) => {
          promiseResolver = promiseResolver.then(() => {
            return new UspDeleteLocation().run(databaseName, list.id, locationId);
          });
        });
        return promiseResolver;
      })
      .then(() => {
        // 3. Update list count of deleted location
        logger.log(
          `Updating list count with parameters database: ${databaseName}, list table: ${list.list_table_name}, list id: ${list.id}`
        );
        return new UspUpdateListCount().run(databaseName, list.list_table_name, list.id);
      })
      .then(() => {
        // 4. Unlock list to allow further interaction
        logger.log(`Unlock list with parameters database: ${databaseName}, list id: ${listId}`);
        return new UspSetListUnlocked().run(databaseName, listId);
      })
      .then(async () => {
        // 5. Set list status to DRAFT
        logger.log(`Set list status with parameters database: ${databaseName}, list id: ${listId}`);
        await new UspResetListStatus().run(databaseName, listId, ListStatus.Draft, gfwListId);
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

/** @function {BulkDeleteLocations}
 *   @summary Deletes locations from a list
 *   @param {String} databaseName
 *   @param {Number} listId
 *   @param {Number} userId
 *   @param {Number} gfwListId
 *   @param {Array} selectedLocations
 *   @param {String} country
 *   @param {String} state
 *   @param {String} subState
 *   @param {Number} analysisAreaMin
 *   @param {Number} analysisAreaMax
 *   @param {String} searchString
 *   @return {Promise}
 */
export const BulkDeleteLocations = (
  databaseName,
  listId,
  userId,
  gfwListId,
  selectedLocations,
  country,
  state,
  subState,
  analysisAreaMin,
  analysisAreaMax,
  searchString
) => {
  let promiseResolver = Promise.resolve();
  return new Promise((resolve, reject) => {
    // Important variables
    let list: ListNameSchema;
    new UspGetListLockStatus()
      .run(databaseName, {
        list_id: listId,
      })
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // 1. List is unlocked
        if (lock_status === null || (lock_status !== null && lock_user_id !== userId)) {
          // Reject object
          logger.log(
            `List lock status is ${lock_status} and is locked by: ${lock_user_id} and current user is ${userId}`
          );
          throw { isLocked: true, lock_user_id };
        } else {
          const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
          return SQLUtils.queryDBFirstRow<ListNameSchema>(
            databaseName,
            'uspGetListNameSchema',
            parameters
          );
        }
      })
      .then((record) => {
        // 2. Deleting list locations
        list = record;
        promiseResolver = promiseResolver.then(() => {
          return new UspDeleteLocationIdsFilteredDataForUserList().run(databaseName, {
            listID: list.id,
            selectedLocations,
            country,
            state,
            subState,
            analysisAreaMin,
            analysisAreaMax,
            searchString,
          });
        });
        return promiseResolver;
      })
      .then(() => {
        // 3. Update list count of deleted location
        logger.log(
          `Updating list count with parameters database: ${databaseName}, list table: ${list.list_table_name}, list id: ${list.id}`
        );
        return new UspUpdateListCount().run(databaseName, list.list_table_name, list.id);
      })
      .then(() => {
        // 4. Unlock list to allow further interaction
        logger.log(`Unlock list with parameters database: ${databaseName}, list id: ${listId}`);
        return new UspSetListUnlocked().run(databaseName, listId);
      })
      .then(async () => {
        // 5. Set list status to DRAFT
        logger.log(`Set list status with parameters database: ${databaseName}, list id: ${listId}`);
        await new UspResetListStatus().run(databaseName, listId, ListStatus.Draft, gfwListId);
        resolve(true);
      })
      .catch((err) => {
        console.log('Error in deleting location', err);
        reject(err);
      });
  });
};

/** @function {DeleteList}
 *   @summary Deletes a list
 *   @param {Number} list_id
 *   @param  {Number} userId
 *   @return {Promise}
 */
export const DeleteList = (databaseName, listId, userId) => {
  return new Promise((resolve, reject) => {
    // Important variables
    new UspGetListLockStatus()
      .run(databaseName, {
        list_id: listId,
      })
      .then((record) => {
        const { lock_status, lock_user_id } = record;
        // 1. List is unlocked
        if (lock_status === null || (lock_status !== null && lock_user_id !== userId)) {
          // Reject object
          throw { isLocked: true, lock_user_id };
        } else {
          const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
          return SQLUtils.queryDBFirstRow<ListNameSchema>(
            databaseName,
            'uspGetListNameSchema',
            parameters
          );
        }
      })
      .then(() => {
        // 2. Deleting list locations
        new UspDeleteList().run(databaseName, listId);
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

export const UnlockListAndSaveAsDraft = async (
  clientDatabase,
  listId,
  gfwListId
): Promise<void> => {
  await new UspSetListUnlocked().run(clientDatabase, listId);
  await new UspResetListStatus().run(clientDatabase, listId, ListStatus.Draft, gfwListId);
};

export const UnlockList = (clientDatabase, listId) => {
  return new UspSetListUnlocked().run(clientDatabase, listId);
};

export const SetListDrafStatus = (clientDatabase, listId, gfwListId) => {
  return new UspResetListStatus().run(clientDatabase, listId, ListStatus.Draft, gfwListId);
};
export class DeleteListTypeOrm {
  private readonly logger = new Logger('List processing service');
  private readonly clientStoreConnection = new ClientStoreConnection();

  async delete(
    organizationDatabase: string,
    list_id: number,
    organization_user_id: number
  ): Promise<boolean> {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(List);
    const listFound = await listRepository.findOne({ where: { id: list_id } });
    if (!listFound) {
      this.logger.error('DeleteList: list not found');
      throw new NotFoundException(`List id ${list_id} not found.`);
    }
    const { lockStatus, lockUserId, listTableName, listAnalysisTableName, listName } = listFound;

    if (lockStatus === null) {
      //Lock list
      await this.lockList(organizationDatabase, list_id, organization_user_id);
    }
    // Checking once again
    const { lockStatus: lockStatus_2, lockUserId: lockUserId_2 } = await listRepository.findOne({
      where: { id: list_id },
    });
    if (lockStatus_2 === null || (lockStatus_2 !== null && lockUserId_2 !== organization_user_id)) {
      this.logger.error('DeleteList failure locked', lockUserId);
      throw { isLocked: true, lockUserId };
    } else {
      const activityLogRepository = connection.getRepository(ActivityLog);
      try {
        // Try to delete list's attributes
        try {
          await connection.query(`DROP TABLE IF EXISTS [${listTableName}]`);
          await connection.query(`DROP TABLE IF EXISTS [${listAnalysisTableName}]`);
        } catch (error) {
          this.logger.error('DeleteList failure drop tables', error);
          throw new InternalServerErrorException({
            message: `Failed to delete attributes from list id ${list_id}`,
            code: 603,
          });
        }
        // Delete list
        try {
          await listRepository.delete({ id: list_id });
        } catch (error) {
          this.logger.error('DeleteList failure Lists', error);
          throw new InternalServerErrorException({
            message: `Failed to delete list ${list_id}`,
            code: 603,
          });
        }
        // delete Analyses
        try {
          await connection.query(`DELETE FROM Analyses WHERE list_id = ${list_id}`);
        } catch (error) {
          this.logger.error('DeleteList failure Analyses', error);
          throw new InternalServerErrorException({
            message: `Failed to delete analyses ${list_id}`,
            code: 603,
          });
        }
        // delete AFIAnalysis
        try {
          await connection.query(`DELETE FROM AFIAnalysis WHERE list_id = ${list_id}`);
        } catch (error) {
          this.logger.error('DeleteList failure AFIAnalysis', error);
          throw new InternalServerErrorException({
            message: `Failed to delete AFIAnalysis ${list_id}`,
            code: 603,
          });
        }
        // delete ListsAnalysisStatus
        try {
          await connection.query(`DELETE FROM ListsAnalysisStatus WHERE ListID = ${list_id}`);
        } catch (error) {
          this.logger.error('DeleteList failure ListsAnalysisStatus', error);
          throw new InternalServerErrorException({
            message: `Failed to delete ListsAnalysisStatus ${list_id}`,
            code: 603,
          });
        }
        // delete Analyses-Dashboard
        try {
          await connection.query(`DELETE FROM [Analyses-Dashboard] WHERE list_id = ${list_id}`);
        } catch (error) {
          this.logger.error('DeleteList failure Analyses-Dashboard', error);
          throw new InternalServerErrorException({
            message: `Failed to delete Analyses-Dashboard ${list_id}`,
            code: 603,
          });
        }
        if (!activityLogRepository) {
          throw new InternalServerErrorException('Failed to get repository for ActivityLog');
        }
        try {
          // Salve log at ActivityLog table
          const activityLog = new ActivityLog();
          activityLog.userId = organization_user_id;
          activityLog.activityTypeId = 21;
          activityLog.activityDescription = `User '${organization_user_id}' has deleted list (${listName}).`;
          activityLog.activityTime = new Date();
          await activityLogRepository.save(activityLog);

          // Return message that the list was deleted to user
          return true;
        } catch (error) {
          // If some problem occurs, return message that the list was not deleted to user
          this.logger.error('DeleteList failure ActivityLog', error);
          throw new InternalServerErrorException({
            message: `Failed to save logs from list id ${list_id}`,
            code: 603,
          });
        }
      } catch (error) {
        this.logger.error('DeleteList failure with deletions', error);
        // Salve log at ActivityLog table
        const activityLog = new ActivityLog();
        activityLog.userId = organization_user_id;
        activityLog.activityTypeId = 21;
        activityLog.activityDescription = `User '${organization_user_id}' has tried to delete list (${listName}) but some error occurs ${error.message}.`;
        activityLog.activityTime = new Date();
        await activityLogRepository.save(activityLog);
        throw new InternalServerErrorException({
          message: `User '${organization_user_id}' has tried to delete list (${listName}) but some error occurs ${error.message}.`,
          code: 603,
        });
      }
    }
  }
  private async lockList(
    organizationDatabase: string,
    list_id: number,
    organization_user_id: number
  ): Promise<boolean> {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(List);
    const { lockStatus } = await listRepository.findOne({ where: { id: list_id } });

    if (lockStatus !== null) {
      return false;
    }

    try {
      await listRepository.update(
        { id: list_id },
        { lockStatus: new Date(), lockUserId: organization_user_id }
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to lock list ${list_id}`,
        code: 610,
      });
    }
  }
  private async unlockList(
    organizationDatabase: string,
    list_id: number,
    organization_user_id: number
  ): Promise<boolean> {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(List);
    const { lockStatus, lockUserId } = await listRepository.findOne({ where: { id: list_id } });

    if (lockStatus !== null && lockUserId !== organization_user_id) {
      return false;
    }
    try {
      await listRepository.update(
        { id: list_id },
        { lockStatus: null, lockUserId: organization_user_id }
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to unlock list ${list_id}`,
        code: 610,
      });
    }
  }
}
