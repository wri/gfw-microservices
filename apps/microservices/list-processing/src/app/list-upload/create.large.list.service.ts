import { Injectable, Logger } from '@nestjs/common';
import { CreateListRequest } from '../../models';
import { CreateListResult } from '@wri-monorepos/geo';
import { AbstractHandler, ChainType, RequestNewList } from './chain/types';
import { SQLUtils } from '@wri-monorepos/sql';
import { ListSchemaName } from './chain/list.schema.name';
import { CreateListLevelData } from './chain/create.list.level.data';
import { CreateLocationSchema } from './chain/create.location.schema';
import { ConvertCommodityToMapsPamCode } from './chain/convert.commodity.mapspam';
import { checkIfListExist } from './shared/cheker.utils';

@Injectable()
export class CreateLargeListService {
  private readonly logger = new Logger(CreateLargeListService.name);

  async run({
    listName,
    userId,
    clientDatabase,
    analysisIds,
    templateId = 13,
    gfwListId = null,
    commodity = 'Unknown',
    saveAsDraft = false,
    existingListId = null,
  }: {
    templateId?: number;
    gfwListId?: number | null;
    isUploadListLpEnabled?: boolean;
    commodity?: string;
  } & Partial<CreateListRequest>): Promise<CreateListResult> {
    let chainType: ChainType = {
      request: {
        list_name: listName,
        organization_database: clientDatabase,
        listTable: listName,
        gfwListId: gfwListId,
        user_id: userId,
        template_id: templateId,
        analysisIds: analysisIds,
        commodity: commodity,
        saveAsDraft: saveAsDraft,
        existingListId: existingListId,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const connection = new SQLUtils();
    await connection.connect(clientDatabase);

    const convertCommodityToMapsPamCode = new ConvertCommodityToMapsPamCode();
    const listSchemaName = new ListSchemaName();
    const createListLevelData = new CreateListLevelData();
    const createLocationSchema = new CreateLocationSchema(connection);

    if (existingListId) {
      const listExistAtClientStore = await checkIfListExist(existingListId, clientDatabase);
      if (!listExistAtClientStore) {
        this.logger.warn(`List not found with id ${existingListId} at client store`);
        throw new Error(`List not found with id ${existingListId} at client store`);
      } else {
        this.logger.log(`List ${existingListId} found at client store`);
        return {
          list_id: existingListId,
        };
      }
    }

    convertCommodityToMapsPamCode
      .setNext(listSchemaName)
      .setNext(createListLevelData)
      .setNext(createLocationSchema);

    chainType = await AbstractHandler.runFullChain(convertCommodityToMapsPamCode, chainType);
    await connection.disconnect();

    return {
      list_id: (chainType.request as RequestNewList)?.list_id,
    };
  }
}
