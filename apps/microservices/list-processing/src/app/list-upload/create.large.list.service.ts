import { Injectable } from '@nestjs/common';
import { CreateListRequest } from '../../models';
import { CreateListResult } from '@wri-monorepos/geo';
import { AbstractHandler, ChainType, RequestNewList } from './chain/types';
import { SQLUtils } from '@wri-monorepos/sql';
import { ListSchemaName } from './chain/list.schema.name';
import { CreateListLevelData } from './chain/create.list.level.data';
import { CreateLocationSchema } from './chain/create.location.schema';

@Injectable()
export class CreateLargeListService {
  async run({
    listName,
    userId,
    clientDatabase,
    analysisIds,
    templateId = 13,
    gfwListId = null,
  }: {
    templateId?: number;
    gfwListId?: number | null;
    isUploadListLpEnabled?: boolean;
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
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const connection = new SQLUtils();
    await connection.connect(clientDatabase);

    const listSchemaName = new ListSchemaName();
    const createListLevelData = new CreateListLevelData();
    const createLocationSchema = new CreateLocationSchema(connection);

    listSchemaName.setNext(createListLevelData).setNext(createLocationSchema);

    chainType = await AbstractHandler.runFullChain(listSchemaName, chainType);
    await connection.disconnect();

    return {
      list_id: (chainType.request as RequestNewList)?.list_id,
    };
  }
}
