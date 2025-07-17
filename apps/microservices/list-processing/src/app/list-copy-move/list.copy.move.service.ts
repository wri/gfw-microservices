import { Injectable, Logger } from '@nestjs/common';
import { CopyOrMoveLargeListRequestLLP } from '../../models';
import {
  ActionType,
  TargetListType,
  upgradeListSchema,
  UspGetLocationsFilteredToCopy,
} from '@wri-monorepos/sql';
import {
  CheckListNameIsValid,
  FeatureCollection,
  getListAnalysisStatusByListId,
  ListHasFiltersApplies,
} from '@wri-monorepos/geo';
import { handleNewListCreation } from './handler/list.creation';
import { handleSourceListDeletion } from './handler/source.list.deletion';
import { assembleGeojson } from './shared/assemble.geojson';
import { createFeatureProps } from './shared/create.feature.props';
import { deleteGeoJSONFeatureProperties } from './shared/delete.geojson.feature.properties';
import { handleExistingListUpdate } from './handler/existing.list.update';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { EmailService } from '@wri-monorepos/aws';
import { PutListAsDraft } from '../list-upload/chain/put.list.as.draft';
import { ProcessUploadData } from '../list-upload/chain/process.upload.data';
import { ConvertGeojsonProperties } from '../list-upload/chain/convert.geojson.properties';
import { AbstractHandler } from '../list-upload/chain/types';
import { CommodityService } from '../list/commodity.service';
import { UpdateListAttributesRemoveIdColumns } from '../list-upload/chain/update.list.attributes.remove.id.columns';

interface ProcessingChainParams {
  moveToList: { id: number; list_name: string };
  clientDatabase: string;
  organizationId: number;
  subscriptionStatusId: number;
  geojson: FeatureCollection;
  sourceListId?: number;
  isNotDeletingTheSourceList?: boolean;
}

@Injectable()
export class ListCopyMoveService {
  constructor(
    private readonly config: ConfigService<ServerConfigType, true>,
    private readonly emailService: EmailService,
    private readonly commodityService: CommodityService
  ) {}

  private readonly logger = new Logger(ListCopyMoveService.name);

  async run(request: CopyOrMoveLargeListRequestLLP) {
    const { gfwListId } = request;
    if (gfwListId) {
      return await this.runGfwList(request);
    }
    return await this.runUserList(request);
  }

  private async getLocationData(
    clientDatabase: string,
    listId: number,
    request: CopyOrMoveLargeListRequestLLP,
    isGFWList = false
  ) {
    const { selectedLocations, allLocationsSelected = false, filters } = request;

    return await new UspGetLocationsFilteredToCopy().run(clientDatabase, {
      listID: listId,
      selectedLocations: allLocationsSelected ? null : selectedLocations.join(),
      country: filters.country,
      state: filters.state,
      subState: filters.subState,
      analysisAreaMin: filters.analysisAreaMin,
      analysisAreaMax: filters.analysisAreaMax,
      searchString: filters.searchString,
      locationLogic: null,
      columnsToReturn: null,
      isGFWList,
    });
  }

  private async assembleCommonGeojson(
    locationData: any[],
    clientDatabase: string,
    listId: number
  ): Promise<FeatureCollection> {
    const featProps = createFeatureProps(locationData);
    this.logger.log('Assembling GEO JSON');
    const geojson = await assembleGeojson(featProps, locationData, clientDatabase, listId);
    deleteGeoJSONFeatureProperties(geojson);
    return geojson as FeatureCollection;
  }

  private async processUploadChain(params: ProcessingChainParams): Promise<void> {
    const { sourceListId, isNotDeletingTheSourceList } = params;
    const processUploadData = new ProcessUploadData();
    const convertGeojsonProperties = new ConvertGeojsonProperties();

    const chainType = {
      request: {
        list_id: params.moveToList.id,
        organization_database: params.clientDatabase,
        isExternalAPIProcess: false,
        organization_id: params.organizationId,
        subscription_status_id: params.subscriptionStatusId,
        hasUnanalyzableError: false,
        path: '',
      },
      geojson: params.geojson,
    };

    const maybeUpdateListAttributes = new UpdateListAttributesRemoveIdColumns({
      sourceListId,
      isNotDeletingTheSourceList,
    });

    convertGeojsonProperties.setNext(processUploadData).setNext(maybeUpdateListAttributes);
    await AbstractHandler.runFullChain(convertGeojsonProperties, chainType);
  }

  private async createOrUpdateTargetList(
    request: CopyOrMoveLargeListRequestLLP,
    analysisIds: string[],
    listId: number
  ) {
    const {
      listType,
      listName: newListName,
      commodityType,
      saveAsDraft: isSaveAsDraft,
      userId,
      clientDatabase,
      gfwListId,
    } = request;

    let moveToList = { ...request.targetList };

    if (listType === TargetListType.New) {
      const { list_id } = await handleNewListCreation({
        listName: newListName,
        userId,
        clientDatabase,
        analysisIds,
        gfwListId,
        selectedListId: listId,
        commodity: commodityType,
        saveAsDraft: isSaveAsDraft,
        commodityService: this.commodityService,
      });
      this.logger.log(`list created with id: ${list_id}`);
      moveToList = {
        ...moveToList,
        id: list_id,
        list_name: newListName,
      };
    }

    return moveToList;
  }

  private async updateExistingList(
    request: CopyOrMoveLargeListRequestLLP,
    moveToList: { id: number; list_name: string },
    geojson: FeatureCollection,
    analysisIds: string[],
    listId: number
  ): Promise<void> {
    const {
      clientDatabase,
      userId,
      action,
      saveAsDraft: isSaveAsDraft,
      commodityType,
      srcListAnalysisTable,
      selectedLocations,
      gfwListId,
      organizationId,
      subscriptionStatusId,
    } = request;

    await handleExistingListUpdate({
      clientDatabase,
      selectedListId: listId,
      moveToList,
      userId,
      action,
      isSaveAsDraft,
      finalGeojson: geojson,
      commodityType,
      srcListAnalysisTable,
      selectedLocations,
      gfwListId,
      organizationId,
      analysisIds,
      subscriptionStatusId,
    });
  }

  async runGfwList(request: CopyOrMoveLargeListRequestLLP) {
    const {
      action,
      userListNames,
      listType,
      listName,
      gfwListId,
      clientDatabase,
      organizationId,
      subscriptionStatusId,
    } = request;

    CheckListNameIsValid(listType, listName, userListNames);

    this.logger.log('Gathering information for locations');

    // GFW List has only one analysis ID
    const analysisIds = ['FCD'];

    const locationData = await this.getLocationData(clientDatabase, gfwListId, request, true);
    const geojson = await this.assembleCommonGeojson(locationData, clientDatabase, gfwListId);

    const moveToList = await this.createOrUpdateTargetList(request, analysisIds, gfwListId);

    await this.updateExistingList(request, moveToList, geojson, analysisIds, gfwListId);

    await this.processUploadChain({
      moveToList,
      clientDatabase,
      organizationId,
      subscriptionStatusId,
      geojson,
    });

    return {
      success: true,
      action,
    };
  }

  async runUserList(request: CopyOrMoveLargeListRequestLLP) {
    try {
      const {
        listId: selectedListId,
        userListNames,
        action,
        listType,
        listName: newListName,
        targetList,
        userId,
        clientDatabase,
        organizationId,
        subscriptionStatusId,
        gfwListId,
        allLocationsSelected = false,
        filters,
      } = request;

      const putListAsDraft = new PutListAsDraft(this.config, this.emailService);

      // Upgrade the list schema to the latest version
      await upgradeListSchema({
        clientDb: clientDatabase,
        listId: selectedListId,
        userId: userId,
      });

      if (listType !== TargetListType.New) {
        this.logger.log('Copy/Move to an existing list');
        await upgradeListSchema({
          clientDb: clientDatabase,
          listId: targetList.id,
          userId: userId,
        });
      }

      // Grab the analysis that was ran for the existing list.
      const listAnalyses = await getListAnalysisStatusByListId(clientDatabase, selectedListId);
      const analysisIds = listAnalyses.map((analysis) => analysis.analysisId);

      const listName = listType === TargetListType.New ? newListName : targetList?.list_name;
      CheckListNameIsValid(listType, listName, userListNames);

      this.logger.log('Gathering information for locations');

      if (action === ActionType.Move) {
        this.logger.log(
          `Changing source list (${selectedListId}) status to draft because locations will be moved`
        );
        await putListAsDraft.putListAsDraft(clientDatabase, selectedListId, gfwListId);
      }

      const locationData = await this.getLocationData(clientDatabase, selectedListId, request);
      const geojson = await this.assembleCommonGeojson(
        locationData,
        clientDatabase,
        selectedListId
      );

      const moveToList = await this.createOrUpdateTargetList(request, analysisIds, selectedListId);

      await this.updateExistingList(request, moveToList, geojson, analysisIds, selectedListId);

      if (action === ActionType.Move) {
        await handleSourceListDeletion({
          clientDatabase,
          selectedListId,
          userId,
          gfwListId,
          allLocationsSelected,
          filters,
          selectedLocations: request.selectedLocations,
          putListAsDraft,
        });
      }

      await this.processUploadChain({
        moveToList,
        clientDatabase,
        organizationId,
        subscriptionStatusId,
        geojson,
        sourceListId: selectedListId,
        isNotDeletingTheSourceList: Boolean(
          action === ActionType.Move && (!allLocationsSelected || ListHasFiltersApplies(filters))
        ),
      });

      return {
        success: true,
        action,
      };
    } catch (error) {
      this.logger.log(`Error during the copy and move flow ${error.stack || error}`);
    }
  }
}
