import { GeoService } from './geo.service';
import {
  ContainsPunctuation,
  getActiveTye,
  getCustomAttributeNamesAndGenericFields,
  createfeaturePropsForCommodity,
  createFeaturePropsForNonCommodity,
  deleteGeoJSONFeatureProperties,
} from '../utils/list.utils';
import {
  GetListLocations,
  CreateNewUserList,
  requestAnalysisProcess,
  PerformListBulkCopy,
  PerformGetLockStatus,
  UspGetLocationsFilteredToCopy,
  GetTableAnalysisColumnsById,
  CopySingleLocationAnalysis,
  BulkDeleteLocations,
  UspSetListLocked,
  DeleteList,
  SetListDrafStatus,
  UnlockListAndSaveAsDraft,
  UnlockList,
} from '@wri-monorepos/sql';
import { Logger, Injectable } from '@nestjs/common';
import { getFinalGeojson } from '@wri-monorepos/shared';
import { resolve } from 'path';
import { Response } from 'node-fetch';
const DEFAULT_LOCATION_ID = 0;
const EMPTY_CUSTOM_ATTRIBUTES = [];

interface GeoJsonFeature {
  type: string;
  features: any[];
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  constructor (private geoService: GeoService) { }
  assembleGeojson = (
    featProps,
    uploadingData,
    listId,
    clientDatabase
  ): Promise<GeoJsonFeature> => {
    return new Promise<GeoJsonFeature>((resolve, reject) => {
      const geojson: GeoJsonFeature = {
        type: 'FeatureCollection',
        features: [],
      };

      const query = GetListLocations(
        clientDatabase,
        listId,
        DEFAULT_LOCATION_ID
      );

      query
        .then((result) => {
          if (result == undefined) {
            reject('listNotAccessible');
          }

          const selectedListData = this.geoService.createGeoJSON(result);

          const selectedLocationsIDs = uploadingData.map(
            (location) => location.location_id
          );

          if (!selectedListData) {
            reject('GEO JSON creation not success');
          } else {
            const feats = selectedListData.features;
            const filteredLocations = feats.filter((location) => {
              return (
                selectedLocationsIDs.indexOf(location.properties.location_id) >
                -1
              );
            });

            filteredLocations.forEach((location, j) => {
              geojson.features.push({
                type: 'Feature',
                properties: featProps[j],
                geometry: location.geometry,
              });
            });

            resolve(geojson);
          }
        })
        .catch((error) => reject(error));
    });
  };

  MoveLocations = async (
    selectedListId,
    selectedListLocationClasification,
    customAttributesNames,
    userListNames,
    selectedMoveOrCopy,
    selectedNewOrExisting,
    newListName,
    moveToList,
    selectedLocations,
    addType,
    activeTemplate,
    commodityType,
    templateData,
    isSaveAsDraft,
    userId,
    clientDatabase,
    organizationId,
    gfwListId,
    allLocationsSelected = false,
    filters,
    srcListAnalysisTable
  ) => {
    Logger.log(`Applied Filters ${JSON.stringify(filters)}`);

    let createdListId = 0;
    let resultingBulkGeoJSON;
    let destLocationIds = [];
    const {
      country,
      state,
      subState,
      analysisAreaMin,
      analysisAreaMax,
      searchString,
    } = filters;

    const isFiltered =
      country ||
        state ||
        subState ||
        analysisAreaMin ||
        analysisAreaMax ||
        searchString
        ? true
        : false;

    const listName =
      selectedNewOrExisting === 'new' ? newListName : moveToList.list_name;
    const lowerListName = listName ? listName.toLowerCase() : listName;
    const checkListExists = userListNames.find(
      (name) => name === lowerListName
    );
    const checkForPunctuation = lowerListName
      ? ContainsPunctuation(lowerListName)
      : false;

    if (!listName) {
      throw 'missingListName';
    } else if (checkListExists && selectedNewOrExisting === 'new') {
      throw 'listNameAlreadyExists';
    } else if (checkForPunctuation && selectedNewOrExisting === 'new') {
      throw 'invalidListName';
    }

    Logger.log('Gathering information for locations');
    const locationData = await new UspGetLocationsFilteredToCopy().run(
      clientDatabase,
      {
        listID: selectedListId,
        selectedLocations: allLocationsSelected
          ? null
          : selectedLocations.join(),
        country,
        state,
        subState,
        analysisAreaMin,
        analysisAreaMax,
        searchString,
      }
    );

    if (selectedMoveOrCopy === 'move') {
      Logger.log(
        `Changing source list (${selectedListId}) status to draft because is going to move locations`
      );
      // Lock source and target list and set source list to draft
      await SetListDrafStatus(clientDatabase, selectedListId, gfwListId);
      if (allLocationsSelected) {
        selectedLocations = [];
        selectedLocations = locationData.map(
          (location: { location_id: number }) => location.location_id
        );
      }
    }

    await new UspSetListLocked().run(clientDatabase, selectedListId, userId);
    if (moveToList) {
      await new UspSetListLocked().run(clientDatabase, moveToList.id, userId);
    }


    let featProps = [];
    let templateId;
    const customAttributes = [];

    Logger.log('Creating GEO JSON object');
    if (addType === 'commodity') {
      let active = activeTemplate;
      if (active === 'investment') {
        active = getActiveTye(commodityType, active);
      }

      const [customAttributeNames, genericFields] =
        getCustomAttributeNamesAndGenericFields(
          customAttributesNames,
          templateData
        );

      customAttributeNames.forEach((customAtt) => {
        customAttributes.push({
          column_name: customAtt,
          column_type: 'Text',
        });
      });

      templateId = templateData ? templateData[0].template_id : -1;

      featProps = createfeaturePropsForCommodity(
        locationData,
        customAttributeNames,
        genericFields
      );
    } else {
      templateId = templateData ? templateData[0].template_id : -1;
      featProps = createFeaturePropsForNonCommodity(locationData);
    }
    Logger.log("Assemble GEO JSON")
    return this.assembleGeojson(
      featProps,
      locationData,
      selectedListId,
      clientDatabase
    ).then((geojson) => {
      deleteGeoJSONFeatureProperties(geojson);

      const location_classification = selectedListLocationClasification;
      const gfw_list_id = 0;
      const template_id = templateId;

      Logger.log('Creating final GEO JSON for database insertion');
      const finalGeojson = getFinalGeojson(gfw_list_id, geojson);
      if (selectedNewOrExisting === 'new') {
        Logger.log('Performing copy for new list');
        return PerformGetLockStatus(clientDatabase, selectedListId)
          .then((result) => {
            Logger.log(`Lock status result: ${JSON.stringify(result)}`);
            const { lock_status, lock_user_id } = result;
            if (lock_status === null /*|| lock_status !== null*/) {
              throw 'error';
            } else {
              const createNewUserList = CreateNewUserList(
                newListName,
                template_id,
                location_classification,
                userId,
                EMPTY_CUSTOM_ATTRIBUTES,
                clientDatabase,
                null,
                isSaveAsDraft
              );
              return createNewUserList;
            }
          })
          .then((createListResult) => {
            createdListId = createListResult.list_id;
            Logger.log(
              `Performing bulk copy for List ID: ${createListResult.list_id} to ${newListName}`
            );
            return PerformListBulkCopy(
              createListResult.list_id,
              newListName,
              true,
              finalGeojson,
              commodityType,
              clientDatabase
            );
          })
          .then((bulkUploadResult) => {
            resultingBulkGeoJSON = bulkUploadResult;
            destLocationIds = resultingBulkGeoJSON.features.map(
              (feature) => feature.properties.location_id
            );
            return GetTableAnalysisColumnsById(clientDatabase, selectedListId);
          })
          .then((recordsets) => {
            Logger.log(`Copy location analysis for existing list`);
            let promiseResolver = Promise.resolve();
            const columns = recordsets.map((record: any) => record.COLUMN_NAME);
            const statement = columns
              .map(
                (column) =>
                  `[${column}] = [${srcListAnalysisTable}].[${column}]`
              )
              .join(',');
            selectedLocations.forEach((src_location_id, idx) => {
              promiseResolver = promiseResolver.then(() => {
                return CopySingleLocationAnalysis(
                  selectedListId,
                  createdListId,
                  src_location_id,
                  destLocationIds[idx],
                  statement,
                  clientDatabase
                );
              });
            });

            return promiseResolver;
          })
          .then(
            (
              bulkUploadResult
            ): Promise<Response> | Response | { success: boolean } => {
              if (isSaveAsDraft) {
                return { success: true };
              }
              const postData = {
                list_id: createdListId,
                user_id: userId,
                organization_id: organizationId,
                reanalyze: false,
              };
              return requestAnalysisProcess(postData);
            }
          )
          .then((response) => {
            Logger.log('Request analysis process response');
            Logger.log(response);
            if (response instanceof Response) {
              return response.json();
            }
            return response;
          })
          .then((json) => {
            Logger.log(`JSON: ${JSON.stringify(json)}`);
            const listsToUnlock = [];
            listsToUnlock.push(UnlockList(clientDatabase, selectedListId));
            if (moveToList) {
              listsToUnlock.push(
                UnlockList(clientDatabase, moveToList.id)
              );
            }
            return Promise.all(listsToUnlock);
          }).then((json) => {
            Logger.log(`JSON: ${JSON.stringify(json)}`);
          });
      } else {
        // copy or move to existing list
        Logger.log(`Performing ${selectedMoveOrCopy} for existing list`);
        return PerformListBulkCopy(
          moveToList.id,
          listName,
          false,
          finalGeojson,
          commodityType,
          clientDatabase
        )
          .then((bulkUploadResult) => {
            resultingBulkGeoJSON = bulkUploadResult;
            destLocationIds = resultingBulkGeoJSON.features.map(
              (feature) => feature.properties.location_id
            );
            return GetTableAnalysisColumnsById(clientDatabase, selectedListId);
          })
          .then((recordsets) => {
            Logger.log(`Copy location analysis for existing list`);
            let promiseResolver = Promise.resolve();
            const columns = recordsets.map((record: any) => record.COLUMN_NAME);
            const statement = columns
              .map(
                (column) =>
                  `[${column}] = [${srcListAnalysisTable}].[${column}]`
              )
              .join(',');
            selectedLocations.forEach((src_location_id, idx) => {
              promiseResolver = promiseResolver.then(() => {
                return CopySingleLocationAnalysis(
                  selectedListId,
                  moveToList.id,
                  src_location_id,
                  destLocationIds[idx],
                  statement,
                  clientDatabase
                );
              });
            });

            return promiseResolver;
          })
          .then((): Promise<Response | void> => {
            if (isSaveAsDraft) {
              return UnlockListAndSaveAsDraft(
                clientDatabase,
                moveToList.id,
                gfwListId
              );
            }
            const postData = {
              list_id: moveToList.id,
              user_id: userId,
              organization_id: organizationId,
              reanalyze: false,
            };
            return requestAnalysisProcess(postData);
          })
          .then((response) => {
            Logger.log('Bulk upload response');
            Logger.log(response);
            if (response instanceof Response) {
              return response.json();
            }
            return response;
          })
          .then((json) => {
            Logger.log(`JSON: ${JSON.stringify(json)}`);
            Logger.log('remove locations or list if move is selected');
            return new Promise(() => {
              if (selectedMoveOrCopy === 'move') {
                return new UspSetListLocked()
                  .run(clientDatabase, selectedListId, userId)
                  .then(() => {
                    if (allLocationsSelected && !isFiltered) {
                      return DeleteList(clientDatabase, selectedListId, userId);
                    }
                    return BulkDeleteLocations(
                      clientDatabase,
                      selectedListId,
                      userId,
                      gfwListId,
                      allLocationsSelected ? null : selectedLocations.join(),
                      country,
                      state,
                      subState,
                      analysisAreaMin,
                      analysisAreaMax,
                      searchString
                    );
                  })
                  .then((): Promise<Response | void> => {
                    return SetListDrafStatus(
                      clientDatabase,
                      selectedListId,
                      gfwListId
                    );
                  });
              }
              const listsToUnlock = [];
              listsToUnlock.push(UnlockList(clientDatabase, selectedListId));
              if (moveToList) {
                listsToUnlock.push(
                  UnlockList(clientDatabase, moveToList.id)
                );
              }
              return Promise.all(listsToUnlock);
            });
          })
          .then((json) => {
            Logger.log(`JSON: ${JSON.stringify(json)}`);
          });
      }
    });
  };

  createListNameSchema = (list_name) => ({
    list_table: `list-${list_name.replace(/\s/g, '').toLowerCase()}`,
    analysis_table: `analysis-${list_name.replace(/\s/g, '').toLowerCase()}`,
  });
}
