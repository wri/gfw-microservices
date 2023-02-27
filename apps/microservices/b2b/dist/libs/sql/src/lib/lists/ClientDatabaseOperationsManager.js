"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetListDrafStatus = exports.UnlockList = exports.UnlockListAndSaveAsDraft = exports.DeleteList = exports.BulkDeleteLocations = exports.DeleteLocations = exports.CopySingleLocationAnalysis = exports.GetTableAnalysisColumnsById = exports.PerformGetLockStatus = exports.PerformListBulkCopy = exports.CreateNewUserList = exports.GetListLocations = void 0;
const uspUpdateListCount_1 = require("./uspUpdateListCount");
const uspDeleteLocation_1 = require("./uspDeleteLocation");
const uspGetAnalysisColumns_1 = require("./uspGetAnalysisColumns");
const ListBulkCopy_1 = require("./ListBulkCopy");
const listCreation_1 = require("./listCreation");
const uspGetListLocations_1 = require("./uspGetListLocations");
const uspGetListLockStatus_1 = require("./uspGetListLockStatus");
const uspCopyLocationAnalysis_1 = require("./uspCopyLocationAnalysis");
const uspGetListNameSchema_1 = require("../llp/uspGetListNameSchema");
const uspSetListUnlocked_1 = require("./uspSetListUnlocked");
const uspResetListStatus_1 = require("./uspResetListStatus");
const uspDeleteList_1 = require("./uspDeleteList");
const common_1 = require("@nestjs/common");
const uspDeleteLocationIdsFilteredDataForUserList_1 = require("./uspDeleteLocationIdsFilteredDataForUserList");
const logger = new common_1.Logger('ClientDatabaseOperationsManager');
const DEFAULT_ROWS_REQUESTED = 200000;
const ListStatus = {
    Pending: 1,
    Active: 2,
    Inactive: 3,
    Draft: 4,
    AnalyzingDiagnostic: 5,
    AnalyzingDashboard: 6,
};
const GetListLocations = (clientDatabase, listId, locationId) => {
    const uspListLocations = new uspGetListLocations_1.UspGetListLocations();
    const details = {
        listID: listId,
        locationID: locationId,
        rowsRequested: DEFAULT_ROWS_REQUESTED,
    };
    return uspListLocations.run(clientDatabase, details);
};
exports.GetListLocations = GetListLocations;
const CreateNewUserList = (listName, templateId, locationClassification, userId, customAttributes, clientDatabase, gfwListId, saveAsDraft) => {
    const listCreation = new listCreation_1.SPSListCreation();
    return listCreation.createNewList(listName, templateId, locationClassification, userId, customAttributes, clientDatabase, gfwListId, saveAsDraft);
};
exports.CreateNewUserList = CreateNewUserList;
const PerformListBulkCopy = (listId, listName, createTable, finalGeojson, commodityType, clientDatabase) => {
    const bulkcopy = new ListBulkCopy_1.ListBulkCopy();
    return bulkcopy.uploadBulkLocations(listId, listName, createTable, finalGeojson, commodityType, clientDatabase);
};
exports.PerformListBulkCopy = PerformListBulkCopy;
const PerformGetLockStatus = (clientDatabase, listId) => {
    const listLocationStatus = new uspGetListLockStatus_1.UspGetListLockStatus();
    return listLocationStatus.run(clientDatabase, {
        list_id: listId,
    });
};
exports.PerformGetLockStatus = PerformGetLockStatus;
const GetTableAnalysisColumnsById = (clientDatabase, listId) => {
    const listLocationStatus = new uspGetAnalysisColumns_1.UspGetAnalysisColumns();
    return listLocationStatus.run(clientDatabase, {
        listId: listId,
    });
};
exports.GetTableAnalysisColumnsById = GetTableAnalysisColumnsById;
const CopySingleLocationAnalysis = (srcListId, desListId, srcLocationId, destLocationId, statement, clientDatabase) => {
    const listLocationStatus = new uspCopyLocationAnalysis_1.UspCopyLocationAnalysis();
    return listLocationStatus.run(clientDatabase, {
        desListId,
        destLocationId,
        srcListId,
        srcLocationId,
        statement,
    });
};
exports.CopySingleLocationAnalysis = CopySingleLocationAnalysis;
const DeleteLocations = (databaseName, listId, locationIds, userId, gfwListId) => {
    let promiseResolver = Promise.resolve();
    return new Promise((resolve, reject) => {
        let list;
        new uspGetListLockStatus_1.UspGetListLockStatus()
            .run(databaseName, {
            list_id: listId,
        })
            .then((record) => {
            const { lock_status, lock_user_id } = record;
            if (lock_status === null ||
                (lock_status !== null && lock_user_id !== userId)) {
                logger.log(`List lock status is ${lock_status} and is locked by: ${lock_user_id} and current user is ${userId}`);
                throw { isLocked: true, lock_user_id };
            }
            else {
                return new uspGetListNameSchema_1.UspGetListNameSchema().run(databaseName, {
                    listID: listId,
                });
            }
        })
            .then((record) => {
            list = record;
            locationIds.forEach((locationId) => {
                promiseResolver = promiseResolver.then(() => {
                    return new uspDeleteLocation_1.UspDeleteLocation().run(databaseName, list.id, locationId);
                });
            });
            return promiseResolver;
        })
            .then(() => {
            logger.log(`Updating list count with parameters database: ${databaseName}, list table: ${list.list_table_name}, list id: ${list.id}`);
            return new uspUpdateListCount_1.UspUpdateListCount().run(databaseName, list.list_table_name, list.id);
        })
            .then(() => {
            logger.log(`Unlock list with parameters database: ${databaseName}, list id: ${listId}`);
            return new uspSetListUnlocked_1.UspSetListUnlocked().run(databaseName, listId);
        })
            .then(async () => {
            logger.log(`Set list status with parameters database: ${databaseName}, list id: ${listId}`);
            await new uspResetListStatus_1.UspResetListStatus().run(databaseName, listId, ListStatus.Draft, gfwListId);
            resolve(true);
        })
            .catch((err) => {
            console.log('Error in deleting location', err);
            reject(err);
        });
    });
};
exports.DeleteLocations = DeleteLocations;
const BulkDeleteLocations = (databaseName, listId, userId, gfwListId, selectedLocations, country, state, subState, analysisAreaMin, analysisAreaMax, searchString) => {
    let promiseResolver = Promise.resolve();
    return new Promise((resolve, reject) => {
        let list;
        new uspGetListLockStatus_1.UspGetListLockStatus()
            .run(databaseName, {
            list_id: listId,
        })
            .then((record) => {
            const { lock_status, lock_user_id } = record;
            if (lock_status === null ||
                (lock_status !== null && lock_user_id !== userId)) {
                logger.log(`List lock status is ${lock_status} and is locked by: ${lock_user_id} and current user is ${userId}`);
                throw { isLocked: true, lock_user_id };
            }
            else {
                return new uspGetListNameSchema_1.UspGetListNameSchema().run(databaseName, {
                    listID: listId,
                });
            }
        })
            .then((record) => {
            list = record;
            promiseResolver = promiseResolver.then(() => {
                return new uspDeleteLocationIdsFilteredDataForUserList_1.UspDeleteLocationIdsFilteredDataForUserList().run(databaseName, {
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
            logger.log(`Updating list count with parameters database: ${databaseName}, list table: ${list.list_table_name}, list id: ${list.id}`);
            return new uspUpdateListCount_1.UspUpdateListCount().run(databaseName, list.list_table_name, list.id);
        })
            .then(() => {
            logger.log(`Unlock list with parameters database: ${databaseName}, list id: ${listId}`);
            return new uspSetListUnlocked_1.UspSetListUnlocked().run(databaseName, listId);
        })
            .then(async () => {
            logger.log(`Set list status with parameters database: ${databaseName}, list id: ${listId}`);
            await new uspResetListStatus_1.UspResetListStatus().run(databaseName, listId, ListStatus.Draft, gfwListId);
            resolve(true);
        })
            .catch((err) => {
            console.log('Error in deleting location', err);
            reject(err);
        });
    });
};
exports.BulkDeleteLocations = BulkDeleteLocations;
const DeleteList = (databaseName, listId, userId) => {
    return new Promise((resolve, reject) => {
        let list;
        new uspGetListLockStatus_1.UspGetListLockStatus()
            .run(databaseName, {
            list_id: listId,
        })
            .then((record) => {
            const { lock_status, lock_user_id } = record;
            if (lock_status === null ||
                (lock_status !== null && lock_user_id !== userId)) {
                throw { isLocked: true, lock_user_id };
            }
            else {
                return new uspGetListNameSchema_1.UspGetListNameSchema().run(databaseName, {
                    listID: listId,
                });
            }
        })
            .then((record) => {
            list = record;
            new uspDeleteList_1.UspDeleteList().run(databaseName, record.list_name, record.list_table_name, record.list_analysis_table_name);
        })
            .catch((err) => {
            console.log('Error in deleting location', err);
            reject(err);
        });
    });
};
exports.DeleteList = DeleteList;
const UnlockListAndSaveAsDraft = async (clientDatabase, listId, gfwListId) => {
    await new uspSetListUnlocked_1.UspSetListUnlocked().run(clientDatabase, listId);
    await new uspResetListStatus_1.UspResetListStatus().run(clientDatabase, listId, ListStatus.Draft, gfwListId);
};
exports.UnlockListAndSaveAsDraft = UnlockListAndSaveAsDraft;
const UnlockList = (clientDatabase, listId) => {
    return new uspSetListUnlocked_1.UspSetListUnlocked().run(clientDatabase, listId);
};
exports.UnlockList = UnlockList;
const SetListDrafStatus = (clientDatabase, listId, gfwListId) => {
    return new uspResetListStatus_1.UspResetListStatus().run(clientDatabase, listId, ListStatus.Draft, gfwListId);
};
exports.SetListDrafStatus = SetListDrafStatus;
//# sourceMappingURL=ClientDatabaseOperationsManager.js.map