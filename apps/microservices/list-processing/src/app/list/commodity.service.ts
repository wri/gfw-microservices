// src/example/example.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ClientStoreConnection,
  Lists,
  ListSchema,
  ListSchemaType,
  ListTemplate,
} from '@wri-monorepos/sql';
import { EntitySchema, Raw, Repository } from 'typeorm';
import { CommodityResponse, ListResponse } from './types';
import { ConvertCommodityToMapsPamCode } from '../list-upload/chain/convert.commodity.mapspam';

@Injectable()
export class CommodityService {
  constructor(
    @InjectRepository(ListTemplate, 'default')
    private readonly listTemplateRepository: Repository<ListTemplate>
  ) {}

  async getCommodityFromExistingList(
    organizationDatabase: string,
    listId: number
  ): Promise<CommodityResponse> {
    try {
      const listTemplate = await this.listTemplateRepository.find();
      const {
        commodity: commodityList,
        listTableName,
        templateId,
      } = await this.getListCommodityAndTableName(organizationDatabase, listId);
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

      const template = listTemplate.find((template) => template.id === templateId);
      if (template) {
        return {
          commodity: template.templateName,
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
  ): Promise<{ commodity: string; listTableName: string; templateId: number }> {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(Lists);
    const { Commodity, listTableName, templateId } = await listRepository.findOne({
      where: { id: listId },
    });
    return { commodity: Commodity, listTableName, templateId };
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

  async getListsByCommodity({
    commodity,
    organizationDatabase,
  }: {
    commodity: string;
    organizationDatabase: string;
  }): Promise<Array<ListResponse>> {
    try {
      const listTemplate = await this.listTemplateRepository.findOne({
        where: { templateName: commodity },
      });
      const clientStoreConnection = new ClientStoreConnection();
      const connection = await clientStoreConnection.getConnection(organizationDatabase, [Lists]);
      const listRepository = connection.getRepository(Lists);

      // TODO: remove the case sensitivity when ticket 3983 is done
      const lists = await listRepository.find({
        where: [
          {
            Commodity: Raw(
              (alias) =>
                `LOWER(${alias}) COLLATE Latin1_General_CI_AI = LOWER(:commodity) COLLATE Latin1_General_CI_AI`, // makes the commodity name lower case and removes accents, so that "Maíz" matches "maiz", for example
              { commodity: ConvertCommodityToMapsPamCode.getCommodityName(commodity) }
            ),
          },
          listTemplate ? { templateId: listTemplate.id } : null,
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

  async getAllTemplates(): Promise<ListTemplate[]> {
    return await this.listTemplateRepository.find();
  }
}
