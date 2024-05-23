import { Injectable, Logger } from '@nestjs/common';
import { listStatus } from '@wri-monorepos/constants';
import {
  CheckListNameIsValid,
  GeoService,
  GetTemplateId,
  ListHasFiltersApplies,
  PerformCopyAnalysis,
  PerformLocationsBulkCopy,
  UnlockLists,
  createFeatureProps,
  deleteGeoJSONFeatureProperties,
  getAnalysisTypesFromIds,
  getListAnalysisStatus,
  SPSListCreation,
  GeoJson,
} from '@wri-monorepos/geo';
import { checkProcessingLimits, getFinalGeojson } from '@wri-monorepos/shared';
import {
  BulkDeleteLocations,
  CopyOrMoveLargeListRequest,
  ActionType,
  TargetListType,
  DeleteList,
  PerformGetLockStatus,
  SetListDrafStatus,
  UnlockListAndSaveAsDraft,
  UspGetLocationsFilteredToCopy,
  UspSetListLocked,
  requestAnalysisProcess,
  updateListsAnalysisStatus,
} from '@wri-monorepos/sql';
import { ProcessingLimitException } from '../app/app.exceptions';

const EMPTY_CUSTOM_ATTRIBUTES = [];

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  constructor(private geoService: GeoService) {}
  assembleGeojson = (featProps, uploadingData): Promise<GeoJson> => {
    return new Promise<GeoJson>((resolve, reject) => {
      const geojson: GeoJson = {
        type: 'FeatureCollection',
        features: [],
      };

      const selectedListData = this.geoService.createGeoJSON(uploadingData);

      const selectedLocationsIDs = uploadingData.map((location) => location.location_id);

      if (!selectedListData) {
        reject('GEO JSON creation not success');
      } else {
        const feats = selectedListData.features;
        const filteredLocations = feats.filter((location) => {
          return selectedLocationsIDs.indexOf(location.properties.location_id) > -1;
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

  MoveLocations = async ({
    listId: selectedListId,
    selectedListLocationClasification,
    customAttributesNames,
    userListNames,
    action,
    listType,
    listName: newListName,
    targetList: moveToList,
    selectedLocations,
    addType,
    // activeTemplate,
    commodityType,
    templateData,
    saveAsDraft: isSaveAsDraft,
    userId,
    clientDatabase,
    organizationId,
    subscriptionStatusId,
    gfwListId,
    allLocationsSelected = false,
    filters,
    srcListAnalysisTable,
  }: CopyOrMoveLargeListRequest) => {
    const unlock = [];
    try {
      this.logger.log(`Applied Filters ${JSON.stringify(filters)}`);

      // Validate list name
      const listName = listType === TargetListType.New ? newListName : moveToList?.list_name;
      CheckListNameIsValid(listType, listName, userListNames);

      // Gather location data
      this.logger.log('Gathering information for locations');
      const locationData = await new UspGetLocationsFilteredToCopy().run(clientDatabase, {
        listID: selectedListId,
        selectedLocations: allLocationsSelected ? null : selectedLocations.join(),
        country: filters.country,
        state: filters.state,
        subState: filters.subState,
        analysisAreaMin: filters.analysisAreaMin,
        analysisAreaMax: filters.analysisAreaMax,
        searchString: filters.searchString,
      });

      if (action === ActionType.Move) {
        this.logger.log(
          `Changing source list (${selectedListId}) status to draft because locations will be moved`
        );
        await SetListDrafStatus(clientDatabase, selectedListId, gfwListId);
      }

      // Map the location ids
      selectedLocations = locationData.map(
        (location: { location_id: number }) => location.location_id
      );

      // Lock the source and target lists
      await new UspSetListLocked().run(clientDatabase, selectedListId, userId);
      unlock.push(selectedListId);
      if (moveToList) {
        await new UspSetListLocked().run(clientDatabase, moveToList.id, userId);
        unlock.push(moveToList.id);
      }

      // Create Feature Props object
      this.logger.log('Creating Feature Props object');
      const templateId = GetTemplateId(templateData);
      const featProps = createFeatureProps(
        locationData,
        addType,
        templateData,
        customAttributesNames.join()
      );

      // Assemble GEO JSON
      this.logger.log('Assembling GEO JSON');
      const geojson = await this.assembleGeojson(featProps, locationData);
      deleteGeoJSONFeatureProperties(geojson);

      // Create final GEO JSON
      this.logger.log('Creating final GEO JSON for database insertion');
      const finalGeojson = getFinalGeojson(0, geojson);
      const listAnalyses = await getListAnalysisStatus(clientDatabase, selectedListId);
      const analysisIds = listAnalyses.map((analysis) => analysis.analysisId);

      if (listType === TargetListType.New) {
        // Handle new list creation
        await this.handleNewListCreation({
          newListName,
          templateId,
          selectedListLocationClasification,
          userId,
          customAttributesNames: EMPTY_CUSTOM_ATTRIBUTES,
          clientDatabase,
          analysisIds,
          isSaveAsDraft,
          finalGeojson,
          commodityType,
          selectedListId,
          srcListAnalysisTable,
          selectedLocations,
          organizationId,
          subscriptionStatusId,
        });
      } else {
        // Handle existing list copy or move
        await this.handleExistingListUpdate({
          action,
          moveToList,
          finalGeojson,
          commodityType,
          clientDatabase,
          selectedListId,
          selectedLocations,
          srcListAnalysisTable,
          isSaveAsDraft,
          gfwListId,
          organizationId,
          subscriptionStatusId,
          userId,
        });
      }

      // Delete locations from the source list if action is move
      if (action === ActionType.Move) {
        await this.handleSourceListDeletion({
          clientDatabase,
          selectedListId,
          userId,
          gfwListId,
          allLocationsSelected,
          filters,
          selectedLocations,
        });
      }

      return {
        success: true,
        action,
      };
    } catch (error) {
      this.logger.error(`in MoveLocations: ${error.message}`);
      if (unlock.length > 0) {
        await UnlockLists(clientDatabase, unlock);
        this.logger.log(`Lists unlocked: ${unlock.join()}`, 'LocationsService');
      }
      // back to Nest
      throw error;
    }
  };

  handleNewListCreation = async ({
    newListName,
    templateId,
    selectedListLocationClasification,
    userId,
    customAttributesNames,
    clientDatabase,
    analysisIds,
    isSaveAsDraft,
    finalGeojson,
    commodityType,
    selectedListId,
    srcListAnalysisTable,
    selectedLocations,
    organizationId,
    subscriptionStatusId,
  }) => {
    this.logger.log('Performing copy for new list');
    const lockResult = await PerformGetLockStatus(clientDatabase, selectedListId);
    if (lockResult.lock_status === null) {
      throw new Error('LIST_NOT_LOCKED');
    }

    const listCreation = new SPSListCreation();
    const createdUserList = await listCreation.createNewList(
      newListName,
      templateId,
      selectedListLocationClasification,
      userId,
      customAttributesNames,
      clientDatabase,
      analysisIds,
      null,
      isSaveAsDraft
    );

    const createdListId = createdUserList.list_id;
    await new UspSetListLocked().run(clientDatabase, createdListId, userId);

    this.logger.log(
      `Performing bulk copy for List ID: ${createdUserList.list_id} to ${newListName}`
    );
    const destLocationIds = await PerformLocationsBulkCopy(
      createdUserList.list_id,
      newListName,
      true,
      finalGeojson,
      commodityType,
      clientDatabase
    );

    this.logger.log(`Copy location analysis for new list`);
    await PerformCopyAnalysis(
      clientDatabase,
      srcListAnalysisTable,
      selectedListId,
      createdListId,
      selectedLocations,
      destLocationIds
    );

    if (!isSaveAsDraft) {
      await this.handleProcessingLimits({
        clientDatabase,
        organizationId,
        subscriptionStatusId,
        listId: createdListId,
        userId,
        analysisIds,
      });
    }

    await UnlockLists(clientDatabase, [selectedListId, createdListId]);
    this.logger.log(`Lists unlocked ${selectedListId}, ${createdListId}`, 'LocationsService');
  };

  handleExistingListUpdate = async ({
    action,
    moveToList,
    finalGeojson,
    commodityType,
    clientDatabase,
    selectedListId,
    selectedLocations,
    srcListAnalysisTable,
    isSaveAsDraft,
    gfwListId,
    organizationId,
    subscriptionStatusId,
    userId,
  }) => {
    this.logger.log(`Performing ${action} for existing list`);
    const destLocationIds = await PerformLocationsBulkCopy(
      moveToList.id,
      moveToList.list_name,
      false,
      finalGeojson,
      commodityType,
      clientDatabase
    );

    this.logger.log(`Copy location analysis for existing list`);
    await PerformCopyAnalysis(
      clientDatabase,
      srcListAnalysisTable,
      selectedListId,
      moveToList.id,
      selectedLocations,
      destLocationIds
    );

    if (isSaveAsDraft) {
      await UnlockListAndSaveAsDraft(clientDatabase, moveToList.id, gfwListId);
    } else {
      const listAnalyses = await getListAnalysisStatus(clientDatabase, moveToList.id);
      const analysisIds = listAnalyses.map((analysis) => analysis.analysisId);
      await this.handleProcessingLimits({
        clientDatabase,
        organizationId,
        subscriptionStatusId,
        listId: moveToList.id,
        userId,
        analysisIds,
      });
    }

    await UnlockLists(clientDatabase, [selectedListId, moveToList.id]);
    this.logger.log(
      `Lists unlocked, source list: ${selectedListId}, target list: ${moveToList.id}`,
      'LocationsService'
    );
  };

  handleSourceListDeletion = async ({
    clientDatabase,
    selectedListId,
    userId,
    gfwListId,
    allLocationsSelected,
    filters,
    selectedLocations,
  }) => {
    this.logger.log('Checking if source list needs to be deleted when move action is selected');
    await new UspSetListLocked().run(clientDatabase, selectedListId, userId);

    if (allLocationsSelected && !ListHasFiltersApplies(filters)) {
      this.logger.log(`Delete list ${selectedListId} because all locations were moved.`);
      await DeleteList(clientDatabase, selectedListId, userId);
    } else {
      this.logger.log(
        `Deleting selected locations from source list ${selectedListId}, locations: ${selectedLocations.join()}.`
      );
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
      await SetListDrafStatus(clientDatabase, selectedListId, gfwListId);
    }
  };

  handleProcessingLimits = async ({
    clientDatabase,
    organizationId,
    subscriptionStatusId,
    listId,
    userId,
    analysisIds,
  }) => {
    const { isListLocationOverLimit, processingLimit } = await checkProcessingLimits({
      organizationDb: clientDatabase,
      organizationId,
      subscriptionStatusId,
      listId,
    });

    if (isListLocationOverLimit) {
      await updateListsAnalysisStatus(clientDatabase, {
        listId,
        errorInfo: 'Exceeded Analysis Limit',
        status: listStatus.Inactive,
      });
      throw new ProcessingLimitException();
    }
    const analysis_types = getAnalysisTypesFromIds(analysisIds);
    const postData = {
      list_id: listId,
      user_id: userId,
      organization_id: organizationId,
      reanalyze: false,
      processing_limit: processingLimit,
      analysis_types,
    };
    const analysisRequestResponse = await requestAnalysisProcess(postData);
    const jsonResponse = await analysisRequestResponse.json();
    this.logger.log(`Analysis request response: ${JSON.stringify(jsonResponse)}`);
  };
}
