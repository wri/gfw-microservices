// src/example/example.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ClientStoreConnection,
  Lists,
  ListSchema,
  ListSchemaType,
  ListTemplate,
} from '@wri-monorepos/sql';
import { EntitySchema, Repository } from 'typeorm';
import { CommodityResponse } from './types';

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
  }

  async getListCommodityAndTableName(
    organizationDatabase: string,
    listId: number
  ): Promise<{ commodity: string; listTableName: string; templateId: number }> {
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [Lists]);
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

  async getAllTemplates(): Promise<ListTemplate[]> {
    return await this.listTemplateRepository.find();
  }
}
