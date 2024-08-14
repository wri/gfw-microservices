import { ClientStoreConnection } from '../util';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {
  ListsPalmOilMills,
  ListGFWLists,
  AnalysisPalmOilMills,
  RspoOilPalmConcessions,
  ListOilPalmConcessions,
} from '../entity';
import { In } from 'typeorm';

const ANALYSYS_TABLE_NAMES = {
  'analysis-palmOilMills': AnalysisPalmOilMills,
};

export class GfwLists {
  private readonly logger = new Logger('List processing service');
  private readonly clientStoreConnection = new ClientStoreConnection();

  getAttributesListEntity(list_id: number): any {
    const ATTRIBUTES_LIST_TABLE = ListsPalmOilMills;
    const ATTRIBUTES_LIST_TABLE_NAMES = {
      2: ListOilPalmConcessions,
      3: ListsPalmOilMills,
      5: RspoOilPalmConcessions,
    };
    return ATTRIBUTES_LIST_TABLE_NAMES[list_id] || ATTRIBUTES_LIST_TABLE;
  }
  async getPaginatedAttributes(
    pageNum: number,
    pageSize: number,
    list_id: number,
    organizationDatabase: string,
    ids: number[] = []
  ): Promise<any[]> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(this.getAttributesListEntity(list_id));
      const take = pageSize === 0 ? 50 : pageSize;
      const skip = pageNum > 0 ? (pageNum - 1) * take : 0;

      let items, count;

      if (ids.length > 0) {
        // If ids array is not empty, apply the where clause
        [items, count] = await listRepository.findAndCount({
          where: {
            id: In([...ids]),
          },
          skip,
          take,
          order: {
            id: 'DESC',
          },
        });
      } else {
        [items, count] = await listRepository.findAndCount({
          skip,
          take,
          order: {
            id: 'DESC',
          },
        });
      }
      if (!items) {
        this.logger.error('ListsPalmOilMills: lists not found');
        throw new NotFoundException(`ListsPalmOilMills with list_id ${list_id} not found.`);
      }
      const itemsWithListId = items.map((item) => {
        return { ...item, list_id };
      });
      return [itemsWithListId, count];
    } catch (error) {
      throw new InternalServerErrorException('Error deleting list', error.message);
    }
  }
  async getAnalysisDataForGFWList(
    pageNum: number,
    pageSize: number,
    list_id: number,
    organizationDatabase: string,
    ids: number[] = []
  ) {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listTableName = await this.getListAnalysisTableName(list_id, organizationDatabase);

      const listRepository = connection.getRepository(
        ANALYSYS_TABLE_NAMES[listTableName.list_analysis_table_name]
      );

      const take = pageSize === 0 ? 50 : pageSize;
      const skip = pageNum > 0 ? (pageNum - 1) * take : 0;

      let items = [],
        count = 0;

      if (ids.length > 0) {
        // If ids array is not empty, apply the where clause
        [items, count] = await listRepository.findAndCount({
          where: {
            location_id: In([...ids]),
          },
          skip,
          take,
          order: {
            location_id: 'DESC',
          },
        });
      } else {
        [items, count] = await listRepository.findAndCount({
          skip,
          take,
          order: {
            location_id: 'DESC',
          },
        });
      }
      if (!items) {
        this.logger.error('ListsPalmOilMills: lists not found');
        throw new NotFoundException(`ListsPalmOilMills with list_id ${list_id} not found.`);
      }
      const itemsWithListId = items.map((item) => {
        return { ...item, list_id: list_id };
      });
      return [itemsWithListId, count];
    } catch (error) {
      throw new InternalServerErrorException('Error getAnalysisDataForGFWList', error.message);
    }
  }

  async getListAnalysisTableName(
    list_id: number,
    organizationDatabase: string
  ): Promise<ListGFWLists> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = await connection.getRepository(ListGFWLists);
      const listName = await listRepository.findOne({ where: { id: list_id } });
      return listName;
    } catch (error) {
      throw new InternalServerErrorException('Error when get list_analysis_table', error.message);
    }
  }

  private mapObjectToColumnNames(inputArray: any[], COLUMN_NAMES: any): any {
    return inputArray.map((inputObject) => {
      const mappedObject: any = {};

      for (const [key, columnName] of Object.entries(COLUMN_NAMES)) {
        if (key in inputObject) {
          mappedObject[`${columnName}`] = inputObject[key];
        }
      }

      return mappedObject;
    });
  }
  async getPaginatedTable(
    pageNum: number,
    pageSize: number,
    list_id: number,
    organizationDatabase: string
  ) {
    const result = await this.getPaginatedAttributes(
      pageNum,
      pageSize,
      list_id,
      organizationDatabase,
      []
    );
    return result;
  }
}
