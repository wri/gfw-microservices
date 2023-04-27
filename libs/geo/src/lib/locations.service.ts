import { GeoService } from './geo.service';
import {
  deleteGeoJSONFeatureProperties,
  ListFilters,
  ListHasFiltersApplies,
  CheckListNameIsValid,
  GetTemplateId,
  createFeatureProps,
  UnlockLists,
  PerformCopyAnalysis,
} from '../utils/list.utils';
import {
  CreateNewUserList,
  requestAnalysisProcess,
  PerformListBulkCopy,
  PerformGetLockStatus,
  UspGetLocationsFilteredToCopy,
  BulkDeleteLocations,
  UspSetListLocked,
  DeleteList,
  SetListDrafStatus,
  UnlockListAndSaveAsDraft,
  UnlockList,
} from '@wri-monorepos/sql';
import { Logger, Injectable } from '@nestjs/common';
import { getFinalGeojson } from '@wri-monorepos/shared';
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
    uploadingData
  ): Promise<GeoJsonFeature> => {
    return new Promise<GeoJsonFeature>((resolve, reject) => {
      const geojson: GeoJsonFeature = {
        type: 'FeatureCollection',
        features: [],
      };

      const selectedListData = this.geoService.createGeoJSON(uploadingData);

      const selectedLocationsIDs = uploadingData.map(
        (location) => location.location_id
      );

      if (!selectedListData) {
        reject('GEO JSON creation not success');
      } else {
        const feats = selectedListData.features;
        const filteredLocations = feats.filter((location) => {
          return (selectedLocationsIDs.indexOf(location.properties.location_id) > -1);
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
    filters: ListFilters,
    srcListAnalysisTable
  ) => {
    Logger.log(`Applied Filters ${JSON.stringify(filters)}`);

    let createdListId = 0;
    let resultingBulkGeoJSON;
    let destLocationIds = [];
    const listsToUnlock = Array<number>();

    const isFiltered = ListHasFiltersApplies(filters);
    const listName = selectedNewOrExisting === 'new' ? newListName : moveToList.list_name;

    CheckListNameIsValid(selectedNewOrExisting, listName, userListNames);

    Logger.log('Gathering information for locations');
    const locationData = await new UspGetLocationsFilteredToCopy().run(
      clientDatabase,
      {
        listID: selectedListId,
        selectedLocations: allLocationsSelected
          ? null
          : selectedLocations.join(),
        country: filters.country,
        state: filters.state,
        subState: filters.subState,
        analysisAreaMin: filters.analysisAreaMin,
        analysisAreaMax: filters.analysisAreaMax,
        searchString: filters.searchString,
      }
    );

    if (selectedMoveOrCopy === 'move') {
      Logger.log(`Changing source list (${selectedListId}) status to draft because is going to move locations`);
      // Lock source and target list and set source list to draft
      await SetListDrafStatus(clientDatabase, selectedListId, gfwListId);
    }

    // Map the location ids to an array in the order they were returned
    selectedLocations = [];
    selectedLocations = locationData.map(
      (location: { location_id: number }) => location.location_id
    );


    await new UspSetListLocked().run(clientDatabase, selectedListId, userId);
    if (moveToList) {
      await new UspSetListLocked().run(clientDatabase, moveToList.id, userId);
    }

    Logger.log('Creating Feature Props object');
    let featProps = [];
    const templateId = GetTemplateId(templateData);
    featProps = createFeatureProps(locationData, addType, templateData, customAttributesNames);

    Logger.log("Assemble GEO JSON")
    const geojson = await this.assembleGeojson(featProps, locationData)

    deleteGeoJSONFeatureProperties(geojson);

    const location_classification = selectedListLocationClasification;
    const gfw_list_id = 0;
    const template_id = templateId;

    Logger.log('Creating final GEO JSON for database insertion');
    const finalGeojson = getFinalGeojson(gfw_list_id, geojson);
    if (selectedNewOrExisting === 'new') {
      Logger.log('Performing copy for new list');
      const lockResult = await PerformGetLockStatus(clientDatabase, selectedListId);

      Logger.log(`Lock status result: ${JSON.stringify(lockResult)}`);
      const { lock_status, lock_user_id } = lockResult;
      if (lock_status === null /*|| lock_status !== null*/) {
        throw new Error('LIST_NOT_LOCKED');
      }
      const createdUserList = await CreateNewUserList(
        newListName,
        template_id,
        location_classification,
        userId,
        EMPTY_CUSTOM_ATTRIBUTES,
        clientDatabase,
        null,
        isSaveAsDraft
      );

      createdListId = createdUserList.list_id;
      await new UspSetListLocked().run(clientDatabase, createdListId, userId);

      Logger.log(`Performing bulk copy for List ID: ${createdUserList.list_id} to ${newListName}`);

      const bulkUploadResult = await PerformListBulkCopy(
        createdUserList.list_id,
        newListName,
        true,
        finalGeojson,
        commodityType,
        clientDatabase
      );

      resultingBulkGeoJSON = bulkUploadResult;
      destLocationIds = resultingBulkGeoJSON.features.map(
        (feature) => feature.properties.location_id
      );

      Logger.log(`Copy location analysis for new list`);

      await PerformCopyAnalysis(clientDatabase, srcListAnalysisTable, selectedListId, createdListId, selectedLocations, destLocationIds);

      Logger.log(`Copy analysis complete`, "LocationsService");

      if (!isSaveAsDraft) {
        const postData = {
          list_id: createdListId,
          user_id: userId,
          organization_id: organizationId,
          reanalyze: false,
        };
        const analysisRequestResponse = await requestAnalysisProcess(postData);
        const jsonResponse = await analysisRequestResponse.json();
        Logger.log(`Analysis request response: ${JSON.stringify(jsonResponse)}`);
      }

      Logger.log(`Unlocking lists`, "LocationsService");

      listsToUnlock.push(selectedListId);
      listsToUnlock.push(createdListId);
      await UnlockLists(clientDatabase, listsToUnlock);

      Logger.log(`Lists unlocked ${selectedListId}, ${createdListId}`, "LocationsService");

    } else {
      // copy or move to existing list
      Logger.log(`Performing ${selectedMoveOrCopy} for existing list`);

      const resultingBulkGeoJSON = await PerformListBulkCopy(moveToList.id, listName, false, finalGeojson, commodityType, clientDatabase);

      destLocationIds = resultingBulkGeoJSON.features.map(
        (feature) => feature.properties.location_id
      );

      Logger.log(`Copy location analysis for existing list`);

      await PerformCopyAnalysis(clientDatabase, srcListAnalysisTable, selectedListId, moveToList.id, selectedLocations, destLocationIds);

      Logger.log(`Copy analysis complete`, "LocationsService");

      if (isSaveAsDraft) {
        await UnlockListAndSaveAsDraft(clientDatabase, moveToList.id, gfwListId);
      } else {
        const postData = {
          list_id: moveToList.id,
          user_id: userId,
          organization_id: organizationId,
          reanalyze: false,
        };
        const analysisRequestResponse = await requestAnalysisProcess(postData);
        const jsonResponse = await analysisRequestResponse.json();
        Logger.log(`Analysis request response: ${JSON.stringify(jsonResponse)}`);
      }

      Logger.log('remove locations or list if move is selected');
      if (selectedMoveOrCopy === 'move') {
        await new UspSetListLocked().run(clientDatabase, selectedListId, userId)

        if (allLocationsSelected && !isFiltered) {
          Logger.log('Delete list because all locations were moved');
          await DeleteList(clientDatabase, selectedListId, userId);
        } else {
          Logger.log('Delete selected locations')
          await BulkDeleteLocations(
            clientDatabase,
            selectedListId,
            userId,
            gfwListId,
            allLocationsSelected ? null : selectedLocations.join(),
            filters.country,
            filters.state,
            filters.subState,
            filters.analysisAreaMin,
            filters.analysisAreaMax,
            filters.searchString
          );
        }

        await SetListDrafStatus(clientDatabase, selectedListId, gfwListId);
      }

      listsToUnlock.push(selectedListId);
      listsToUnlock.push(moveToList.id);
      await UnlockLists(clientDatabase, listsToUnlock);
      Logger.log(`Lists unlocked ${selectedListId}, ${moveToList.id}`, "LocationsService");
    }
  };
}
