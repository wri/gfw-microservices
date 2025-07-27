import { Injectable } from '@nestjs/common';
import { CreateListRequest } from '../../models';
import { CreateListResult } from '@wri-monorepos/geo';
import { AbstractHandler, ChainType, RequestNewList } from './chain/types';
import { SQLUtils } from '@wri-monorepos/sql';
import { ListSchemaName } from './chain/list.schema.name';
import { CreateListLevelData } from './chain/create.list.level.data';
import { CreateLocationSchema } from './chain/create.location.schema';
import { ConvertCommodityToMapSpamCode } from './chain/convert.commodity.mapspam';

@Injectable()
export class CreateLargeListService {
  async run({
    listName,
    userId,
    clientDatabase,
    analysisIds,
    gfwListId = null,
    commodity = 'Unknown',
    saveAsDraft = false,
  }: {
    gfwListId?: number | null;
    commodity?: string;
  } & Partial<CreateListRequest>): Promise<CreateListResult> {
    let chainType: ChainType = {
      request: {
        list_name: listName,
        organization_database: clientDatabase,
        listTable: listName,
        gfwListId: gfwListId,
        user_id: userId,
        analysisIds: analysisIds,
        commodity: commodity,
        saveAsDraft: saveAsDraft,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const connection = new SQLUtils();
    await connection.connect(clientDatabase);

    const convertCommodityToMapSpamCode = new ConvertCommodityToMapSpamCode();
    const listSchemaName = new ListSchemaName();
    const createListLevelData = new CreateListLevelData();
    const createLocationSchema = new CreateLocationSchema(connection);

    convertCommodityToMapSpamCode
      .setNext(listSchemaName)
      .setNext(createListLevelData)
      .setNext(createLocationSchema);

    chainType = await AbstractHandler.runFullChain(convertCommodityToMapSpamCode, chainType);
    await connection.disconnect();

    return {
      list_id: (chainType.request as RequestNewList)?.list_id,
    };
  }
}
