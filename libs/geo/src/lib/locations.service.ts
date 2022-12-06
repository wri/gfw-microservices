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
  DeleteLocations,
  UspSetListLocked,
  DeleteList,
} from '@wri-monorepos/sql';
import { Injectable } from '@nestjs/common';
import { getFinalGeojson } from '@wri-monorepos/shared';

const DEFAULT_LOCATION_ID = 0;
const EMPTY_CUSTOM_ATTRIBUTES = [];

interface GeoJsonFeature {
  type: string;
  features: any[];
}

@Injectable()
export class LocationService {
  constructor(private geoService: GeoService) {}
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
    filters
  ) => {
    let createdListId = 0;
    let resultingBulkGeoJSON;
    let destLocationIds = [];
    const { country, state, subState, analysisAreaMin, analysisAreaMax } =
      filters;
    const isFiltered =
      country || state || subState || analysisAreaMin || analysisAreaMax
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
      }
    );
    console.log(locationData);
    console.log(filters);
    let featProps = [];
    let templateId;
    const customAttributes = [];

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

      const finalGeojson = getFinalGeojson(gfw_list_id, geojson);
      if (selectedNewOrExisting === 'new') {
        return PerformGetLockStatus(clientDatabase, selectedListId)
          .then((result) => {
            console.log(result);
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
                null
              );
              return createNewUserList;
            }
          })
          .then((createListResult) => {
            createdListId = createListResult.list_id;
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
            const postData = {
              list_id: createdListId,
              user_id: userId,
              organization_id: organizationId,
              reanalyze: false,
            };
            return requestAnalysisProcess(postData);
          })
          .then((response) => {
            console.log(response);
            return response.json();
          })
          .then((json) => {
            console.log(json);
          });
      } else {
        // existing
        console.log('Performing move for existing list');
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
            let promiseResolver = Promise.resolve();
            const columns = recordsets.map((record: any) => record.COLUMN_NAME);
            const statement = columns
              .map(
                (column) =>
                  `[${column}] = [${moveToList.list_analysis_table_name}].[${column}]`
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
          .then((bulkUploadResult) => {
            resultingBulkGeoJSON = bulkUploadResult;
            const postData = {
              list_id: moveToList.id,
              user_id: userId,
              organization_id: organizationId,
              reanalyze: false,
            };
            return requestAnalysisProcess(postData);
          })
          .then((response) => {
            console.log(response);
            return response.json();
          })
          .then((json) => {
            console.log(json);
            console.log('remove locations or list if move is selected');
            return new Promise((resolve, reject) => {
              if (selectedMoveOrCopy === 'move') {
                return new UspSetListLocked()
                  .run(clientDatabase, selectedListId, userId)
                  .then(() => {
                    if (allLocationsSelected && !isFiltered) {
                      return DeleteList(clientDatabase, selectedListId, userId);
                    }
                    return DeleteLocations(
                      clientDatabase,
                      selectedListId,
                      selectedLocations,
                      userId,
                      gfwListId
                    );
                  });
              }
              resolve(json);
            });
          })
          .then((json) => {
            console.log(json);
          });
      }
    });
  };

  createListNameSchema = (list_name) => ({
    list_table: `list-${list_name.replace(/\s/g, '').toLowerCase()}`,
    analysis_table: `analysis-${list_name.replace(/\s/g, '').toLowerCase()}`,
  });
}
