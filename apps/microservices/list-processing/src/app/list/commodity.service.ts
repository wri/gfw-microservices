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
import { EntitySchema, Repository } from 'typeorm';
import { CommodityResponse, ListResponse } from './types';

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

  async getListsByCommodity(
    organizationDatabase: string,
    commodity: string
  ): Promise<Array<ListResponse>> {
    const listTemplate = await this.listTemplateRepository.find();
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organizationDatabase, [Lists]);
    const listRepository = connection.getRepository(Lists);
    const lists = await listRepository.find();

    const matchedLists = [];

    for (const list of lists) {
      try {
        if (list.Commodity === null) {
          const { commodity: commodityFromLocation } = await this.getCommodityFromLocation(
            organizationDatabase,
            list.listTableName
          );
          if (this.compareIgnoringAccentsAndCase(commodityFromLocation, commodity)) {
            matchedLists.push({ id: list.id, name: list.listName });
          }
          if (commodityFromLocation === null) {
            const template = listTemplate.find((template) => template.id === list.templateId);
            if (this.compareIgnoringAccentsAndCase(commodityFromLocation, template)) {
              matchedLists.push({
                id: list.id,
                name: list.listName,
              });
            }
          }
        } else if (this.compareIgnoringAccentsAndCase(list.Commodity, commodity)) {
          matchedLists.push({ id: list.id, name: list.listName });
        }
      } catch (error) {
        Logger.warn(error.stack || error);
      }
    }

    return matchedLists;
  }

  compareIgnoringAccentsAndCase(str1, str2) {
    const normalizeString = (str) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return normalizeString(str1) === normalizeString(str2);
  }

  async getAllTemplates(): Promise<ListTemplate[]> {
    return await this.listTemplateRepository.find();
  }
}
