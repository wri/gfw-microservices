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
import { ConvertCommodityToMapSpamCode } from '../list-upload/chain/convert.commodity.mapspam';

// Mapping of commodity names to their template IDs
const COMMODITY_TEMPLATE_MAP = {
  'palm oil': ['palm oil mill', 'palm smallholder farm', 'palm oil generic'],
  soy: ['soy silo', 'soy farm', 'soy generic'],
  gfwp_cattle: ['cattle ranch', 'cattle generic'],
  cocoa: ['cocoa farm', 'cocoa generic'],
};

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
      const clientStoreConnection = new ClientStoreConnection();
      const connection = await clientStoreConnection.getConnection(organizationDatabase, [Lists]);
      const listRepository = connection.getRepository(Lists);

      let templateNames = COMMODITY_TEMPLATE_MAP[commodity];

      const commodityName =
        ConvertCommodityToMapSpamCode.getCommoditySpamName(commodity) ||
        commodity.replace(/\s+/g, '_');

      // Get all templates for the commodity if it's in our mapping
      templateNames = [...templateNames, commodityName];
      const templates = await Promise.all(
        templateNames.map((name) =>
          this.listTemplateRepository.findOne({
            where: { templateName: name },
          })
        )
      );

      const validTemplates = templates.filter(Boolean);

      const lists = await listRepository.find({
        where: [
          {
            Commodity: Raw(
              (alias) =>
                `${alias} COLLATE Latin1_General_CI_AI = :commodity COLLATE Latin1_General_CI_AI`,
              { commodity: commodityName }
            ),
          },
          ...validTemplates.map((template) => ({ templateId: template.id })),
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
