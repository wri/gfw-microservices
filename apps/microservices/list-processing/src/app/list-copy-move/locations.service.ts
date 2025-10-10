import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { listStatus } from '@wri-monorepos/constants';
import {
  GeoService,
  ListHasFiltersApplies,
  PerformCopyAnalysis,
  PerformLocationsBulkCopy,
  UnlockLists,
  getAnalysisTypesFromIds,
  getListAnalysisStatusByListId,
  SPSListCreation,
  GeoJson,
} from '@wri-monorepos/geo';
import { checkProcessingLimits } from '@wri-monorepos/shared';
import {
  BulkDeleteLocations,
  CopyOrMoveLargeListRequest,
  DeleteList,
  PerformGetLockStatus,
  SetListDrafStatus,
  UnlockListAndSaveAsDraft,
  UspSetListLocked,
  requestAnalysisProcess,
  updateListsAnalysisStatus,
} from '@wri-monorepos/sql';
import { ListCopyMoveService } from './list.copy.move.service';
import { ServerConfigType } from '../../validators/server-config';
import { ProcessingLimitException } from '../app.exceptions';
import { checkListSizeLimit } from '../common/check.listSizelimit';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  constructor(
    private geoService: GeoService,
    private readonly config: ConfigService<ServerConfigType, true>,

    private readonly listCopyMoveService: ListCopyMoveService
  ) {}
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

  MoveLocations = async (params: CopyOrMoveLargeListRequest) => {
    return this.listCopyMoveService.run(params);
  };

  handleNewListCreation = async ({
    newListName,
    selectedListLocationClassification,
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
      0, // Templates are no longer used
      selectedListLocationClassification,
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

    // Enforce per-list location cap before copying/appending
    await checkListSizeLimit(clientDatabase, moveToList.id, finalGeojson);

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
      const listAnalyses = await getListAnalysisStatusByListId(clientDatabase, moveToList.id);
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
        allLocationsSelected ? null : selectedLocations.join()
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
    const analysisUrl = this.config.get('AWS_ANALYSIS_LAMBDA_URL', { infer: true });
    const analysisRequestResponse = await requestAnalysisProcess(analysisUrl, postData);
    const jsonResponse = await analysisRequestResponse.json();
    this.logger.log(`Analysis request response: ${JSON.stringify(jsonResponse)}`);
  };
}
