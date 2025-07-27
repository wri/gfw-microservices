import { Injectable, Logger } from '@nestjs/common';
import { ClientStoreConnection, Lists, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { EntitySchema, Raw } from 'typeorm';
import { CommodityResponse, ListResponse } from './types';
import { ConvertCommodityToMapSpamCode } from '../list-upload/chain/convert.commodity.mapspam';

@Injectable()
export class CommodityService {
  async getCommodityFromExistingList(
    organizationDatabase: string,
    listId: number
  ): Promise<CommodityResponse> {
    try {
      const { commodity: commodityList, listTableName } = await this.getListCommodityAndTableName(
        organizationDatabase,
        listId
      );
      if (commodityList && commodityList?.toLocaleLowerCase() !== 'other') {
        return {
          commodity: commodityList,
        };
      }

      const { commodity: commodityLocation } = await this.getCommodityFromLocation(
        organizationDatabase,
        listTableName
      );
      if (commodityLocation && commodityLocation?.toLocaleLowerCase() !== 'other') {
        return {
          commodity: commodityLocation,
        };
      }

      return {
        commodity: 'No commodity found',
      };
    } catch (error) {
      Logger.warn(error.stack || error);
      return {
        commodity: 'No commodity found',
      };
    }
  }

  async getListCommodityAndTableName(
    organizationDatabase: string,
    listId: number
  ): Promise<{ commodity: string; listTableName: string }> {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    const { Commodity, listTableName } = await listRepository.findOne({
      where: { id: listId },
    });
    return { commodity: Commodity, listTableName };
  }

  async getCommodityFromLocation(organizationDatabase: string, listTableName: string) {
    const clientStoreConnection = new ClientStoreConnection();
    const ListEntity = new EntitySchema<ListSchemaType>({ ...ListSchema, name: listTableName });
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [
      ListEntity,
    ]);
    const listRepository = connection.getRepository(ListEntity);

    // Use a raw SQL query to get distinct values
    const distinctCommodities: Array<{ commodity: string }> = await listRepository.query(
      `SELECT DISTINCT commodity FROM [${listTableName}]`
    );
    const commodities = distinctCommodities.map((commodity) => commodity.commodity);
    return {
      commodity: commodities.join(', '),
    };
  }

  async getCommodityAndTemplates(commodity: string): Promise<{
    commodityName: string;
  }> {
    const commodityLowerCase = commodity.toLowerCase();

    let commodityName = ConvertCommodityToMapSpamCode.getCommoditySpamName(commodity);
    if (!commodityName) {
      commodityName = commodityLowerCase.startsWith('gfwp_') ? commodity : 'GFWP_' + commodity;
      commodityName = commodityName.replace(/\s+/g, '_');
    }

    return { commodityName };
  }

  // frontend calls this with mapspam code for copy/move from new lists,
  // but with human readable name when uploading new locations.
  // getCommodityAndTemplates() handles both cases
  async getListsByCommodity({
    commodity,
    organizationDatabase,
  }: {
    commodity: string;
    organizationDatabase: string;
  }): Promise<Array<ListResponse>> {
    try {
      const clientStoreConnection = new ClientStoreConnection();
      const connection = await clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(Lists);

      const { commodityName } = await this.getCommodityAndTemplates(commodity);

      const lists = await listRepository.find({
        where: [
          {
            Commodity: Raw(
              (alias) =>
                `${alias} COLLATE Latin1_General_CI_AI = :commodity COLLATE Latin1_General_CI_AI`,
              { commodity: commodityName }
            ),
          },
        ].filter(Boolean),
        select: ['id', 'listName'],
        order: { listName: 'ASC' },
      });

      return lists.map((list) => ({ id: list.id, name: list.listName }));
    } catch (error) {
      Logger.warn(`Error in getListsByCommodity: ${error.stack || error}`);
      return [];
    }
  }

  async checkIfListExistAndCommodityIsTheSame(
    listId: number,
    commodity: string,
    clientDatabase: string
  ): Promise<boolean> {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(clientDatabase);
    const listRepository = connection.getRepository(Lists);

    const { commodityName } = await this.getCommodityAndTemplates(commodity);

    const lists = await listRepository.find({
      where: [
        {
          id: listId,
          ...(commodityName && {
            Commodity: Raw(
              (alias) =>
                `${alias} COLLATE Latin1_General_CI_AI = :commodity COLLATE Latin1_General_CI_AI`,
              { commodity: commodityName }
            ),
          }),
        },
      ].filter(Boolean),
      select: ['id', 'listName'],
      order: { listName: 'ASC' },
    });

    return lists.length > 0;
  }
}
