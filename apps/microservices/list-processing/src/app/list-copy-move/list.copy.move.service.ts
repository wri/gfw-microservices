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

  async runGfwList(request: CopyOrMoveLargeListRequestLLP) {
    const processUploadData = new ProcessUploadData();
    const convertGeojsonProperties = new ConvertGeojsonProperties();

    const {
      action,
      userListNames,
      listType,
      listName,
      targetList,
      selectedLocations,
      commodityType,
      saveAsDraft: isSaveAsDraft,
      userId,
      clientDatabase,
      organizationId,
      subscriptionStatusId,
      gfwListId,
      allLocationsSelected = false,
      filters,
    } = request;

    CheckListNameIsValid(listType, listName, userListNames);

    this.logger.log('Gathering information for locations');

    // GFW List has only one analysis ID
    const analysisIds = ['FCD'];
    let moveToList = { ...targetList };

    const locationData = await new UspGetLocationsFilteredToCopy().run(clientDatabase, {
      listID: gfwListId,
      selectedLocations: allLocationsSelected ? null : selectedLocations.join(),
      country: filters.country,
      state: filters.state,
      subState: filters.subState,
      analysisAreaMin: filters.analysisAreaMin,
      analysisAreaMax: filters.analysisAreaMax,
      searchString: filters.searchString,
      locationLogic: null,
      columnsToReturn: null,
      isGFWList: true,
    });

    const featProps = createFeatureProps(locationData);
    this.logger.log('Assembling GEO JSON');
    const geojson = await assembleGeojson(featProps, locationData, clientDatabase, gfwListId);
    deleteGeoJSONFeatureProperties(geojson);

    const { list_id } = await handleNewListCreation({
      listName,
      userId,
      clientDatabase,
      analysisIds,
      gfwListId,
      selectedListId: gfwListId,
      commodity: commodityType,
      saveAsDraft: isSaveAsDraft,
      commodityService: this.commodityService,
    });
    this.logger.log(`list created with id: ${list_id}`);
    moveToList = {
      ...moveToList,
      id: list_id,
      list_name: listName,
    };

    await handleExistingListUpdate({
      clientDatabase,
      selectedListId: gfwListId,
      moveToList,
      userId,
      action,
      isSaveAsDraft,
      finalGeojson: geojson as FeatureCollection,
      commodityType,
      srcListAnalysisTable: 'GFWLists',
      selectedLocations,
      gfwListId,
      organizationId,
      analysisIds,
      subscriptionStatusId,
    });

    // To update ListAttributes of destination list with new data, we need to
    // run processUploadData (among other things, it automatically upgrades type
    // from number to text), but that requires convertGeojsonProperties, so run
    // that first.
    const chainType = {
      request: {
        list_id: moveToList.id,
        organization_database: clientDatabase,
        isExternalAPIProcess: false,
        organization_id: organizationId,
        subscription_status_id: subscriptionStatusId,
        hasUnanalyzableError: false,
        path: '',
      },
      geojson: geojson as FeatureCollection,
    };

    convertGeojsonProperties.setNext(processUploadData);

    await AbstractHandler.runFullChain(convertGeojsonProperties, chainType);

    return {
      success: true,
      action,
    };
  }

  async runUserList(request: CopyOrMoveLargeListRequestLLP) {
    const processUploadData = new ProcessUploadData();
    const convertGeojsonProperties = new ConvertGeojsonProperties();

    try {
      const {
        listId: selectedListId,
        userListNames,
        action,
        listType,
        listName: newListName,
        targetList,
        selectedLocations,
        commodityType,
        saveAsDraft: isSaveAsDraft,
        userId,
        clientDatabase,
        organizationId,
        subscriptionStatusId,
        gfwListId,
        allLocationsSelected = false,
        filters,
        srcListAnalysisTable,
      } = request;

      let moveToList = { ...targetList };

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
          listId: moveToList.id,
          userId: userId,
        });
      }

      // Grab the analysis that was ran for the existing list.
      const listAnalyses = await getListAnalysisStatusByListId(clientDatabase, selectedListId);
      const analysisIds = listAnalyses.map((analysis) => analysis.analysisId);

      const listName = listType === TargetListType.New ? newListName : moveToList?.list_name;
      CheckListNameIsValid(listType, listName, userListNames);

      this.logger.log('Gathering information for locations');

      if (action === ActionType.Move) {
        this.logger.log(
          `Changing source list (${selectedListId}) status to draft because locations will be moved`
        );
        await putListAsDraft.putListAsDraft(clientDatabase, selectedListId, gfwListId);
      }

      // Getting the existing data for the source list
      const locationData = await new UspGetLocationsFilteredToCopy().run(clientDatabase, {
        listID: selectedListId,
        selectedLocations: allLocationsSelected ? null : selectedLocations.join(),
        country: filters.country,
        state: filters.state,
        subState: filters.subState,
        analysisAreaMin: filters.analysisAreaMin,
        analysisAreaMax: filters.analysisAreaMax,
        searchString: filters.searchString,
        locationLogic: null,
        columnsToReturn: null,
      });

      const featProps = createFeatureProps(locationData);
      this.logger.log('Assembling GEO JSON');
      const geojson = await assembleGeojson(
        featProps,
        locationData,
        clientDatabase,
        selectedListId
      );
      deleteGeoJSONFeatureProperties(geojson);

      // We are copying or moving to a new list so creating the new table
      if (listType === TargetListType.New) {
        const { list_id } = await handleNewListCreation({
          listName,
          userId,
          clientDatabase,
          analysisIds,
          gfwListId,
          selectedListId,
          commodity: commodityType,
          saveAsDraft: isSaveAsDraft,
          commodityService: this.commodityService,
        });
        this.logger.log(`list created with id: ${list_id}`);
        moveToList = {
          ...moveToList,
          id: list_id,
          list_name: listName,
        };
      }

      await handleExistingListUpdate({
        clientDatabase,
        selectedListId,
        moveToList,
        userId,
        action,
        isSaveAsDraft,
        finalGeojson: geojson as FeatureCollection,
        commodityType,
        srcListAnalysisTable,
        selectedLocations,
        gfwListId,
        organizationId,
        analysisIds,
        subscriptionStatusId,
      });

      if (action === ActionType.Move) {
        await handleSourceListDeletion({
          clientDatabase,
          selectedListId,
          userId,
          gfwListId,
          allLocationsSelected,
          filters,
          selectedLocations,
          putListAsDraft,
        });
      }

      // To update ListAttributes of destination list with new data, we need to
      // run processUploadData (among other things, it automatically upgrades type
      // from number to text), but that requires convertGeojsonProperties, so run
      // that first.
      const chainType = {
        request: {
          list_id: moveToList.id,
          organization_database: clientDatabase,
          isExternalAPIProcess: false,
          organization_id: organizationId,
          subscription_status_id: subscriptionStatusId,
          hasUnanalyzableError: false,
          path: '',
        },
        geojson: geojson as FeatureCollection,
      };

      convertGeojsonProperties.setNext(processUploadData);

      await AbstractHandler.runFullChain(convertGeojsonProperties, chainType);

      return {
        success: true,
        action,
      };
    } catch (error) {
      this.logger.log(`Error during the copy and move flow ${error.stack || error}`);
    }
  }
}
