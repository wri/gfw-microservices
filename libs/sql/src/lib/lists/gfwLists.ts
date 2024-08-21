import { ClientStoreConnection } from '../util';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {
  ListsPalmOilMills,
  ListGFWLists,
  AnalysisPalmOilMills,
  RspoOilPalmConcessions,
  ListOilPalmConcessions,
  ListProtectedAreas,
} from '../entity';
import { EntityTarget, FindOptionsWhere, Raw } from 'typeorm';

const ANALYSYS_TABLE_NAMES = {
  'analysis-palmOilMills': AnalysisPalmOilMills,
};
export class GfwLists {
  private readonly logger = new Logger('List processing service');
  private readonly clientStoreConnection = new ClientStoreConnection();
  private readonly DEFAULT_PAGE_SIZE: number = 50;
  private readonly DEFAULT_PAGE_NUM: number = 0;

  getAttributesListEntity(
    list_id: number
  ): EntityTarget<ListOilPalmConcessions | ListsPalmOilMills | RspoOilPalmConcessions> {
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
  ): Promise<[ListOilPalmConcessions[] | ListsPalmOilMills[] | RspoOilPalmConcessions[], number]> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(this.getAttributesListEntity(list_id));
      const take = pageSize === 0 ? this.DEFAULT_PAGE_SIZE : pageSize;
      const skip = pageNum > 0 ? (pageNum - 1) * take : this.DEFAULT_PAGE_NUM;

      let items, count;

      if (ids.length > 0) {
        // If ids array is not empty, apply the where clause
        [items, count] = await listRepository.findAndCount({
          where: {
            id: Raw((alias) => `${alias} IN (:...names)`, {
              names: ids,
            }),
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

      const take = pageSize === 0 ? this.DEFAULT_PAGE_SIZE : pageSize;
      const skip = pageNum > 0 ? (pageNum - 1) * take : this.DEFAULT_PAGE_NUM;

      let items = [],
        count = 0;

      if (ids.length > 0) {
        // If ids array is not empty, apply the where clause
        items = await listRepository.findAndCount({
          where: {
            location_id: Raw((alias) => `${alias} IN (:...names)`, {
              names: ids,
            }),
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

  async getPaginatedAnalysisDataForProtectedAreas(
    pageNum,
    pageSize,
    organizationDatabase,
    filters
  ) {
    const where: FindOptionsWhere<ListProtectedAreas> = {};
    let locationNameArray = [];
    if (typeof filters != 'undefined') {
      if (filters.selectedCountry && filters.selectedCountry !== '') {
        where['Country'] = filters.selectedCountry;
      }
      if (filters.selectedState && filters.selectedState !== '') {
        where['State'] = filters.selectedState;
      }
      if (filters.selectedSubState && filters.selectedSubState !== '') {
        where['Sub State'] = filters.selectedSubState;
      }
      if (filters.selectedDesignation && filters.selectedDesignation !== '') {
        where['Designation'] = filters.selectedDesignation;
      }
      if (filters.selectedDesignationType && filters.selectedDesignationType !== '') {
        where['Designation Type'] = filters.selectedDesignationType;
      }
      if (filters.selectedIUCN) {
        where['IUCN CAT'] = filters.selectedIUCN;
      }
      if (filters.selectedNames?.length > 0) {
        locationNameArray = filters.selectedNames;
      }
    }
    const skip = pageNum > 0 ? (pageNum - 1) * pageSize : this.DEFAULT_PAGE_NUM;
    const take = pageSize === 0 ? this.DEFAULT_PAGE_SIZE : pageSize;
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const analysisDataRepository = await connection.getRepository(ListProtectedAreas);
      let items, count;
      if (locationNameArray.length > 0) {
        [items, count] = await analysisDataRepository.findAndCount({
          where: {
            ...where,
            LocationName: Raw((alias) => `${alias} IN (:...names)`, {
              names: locationNameArray,
            }),
          },
          skip,
          take,
          order: {
            id: 'DESC',
          },
        });
      } else {
        [items, count] = await analysisDataRepository.findAndCount({
          where,
          skip,
          take,
          order: {
            id: 'DESC',
          },
        });
      }
      const itemsWithListId = items.map((item) => {
        return { ...item, 'Location Name': item.LocationName };
      });
      const listDataFields = [
        'Country',
        'Designation',
        'Designation Type',
        'IUCN CAT',
        'Latitude',
        'Location Classification',
        'Location Name',
        'Longitude',
        'Size',
        'State',
        'Sub State',
        'gadmid',
        'globalid',
        'id_in_list',
        'location_id_in_list',
      ];

      const listData = itemsWithListId.map((record) => {
        const filteredRecord = {};
        for (const field of listDataFields) {
          filteredRecord[field] = record[field];
        }
        return {
          ...filteredRecord,
          id: record.id,
          location_id: record.id,
        };
      });
      const omitFields = (
        record: ListProtectedAreas & { 'Location Name': string },
        fields: string[]
      ): any => {
        const filteredRecord: any = {};
        for (const field in record) {
          if (!fields.includes(field)) {
            filteredRecord[field] = record[field];
          }
        }
        return filteredRecord;
      };

      const protectedLocationResult = itemsWithListId.map((record) => {
        return omitFields(record, listDataFields);
      });

      return { listData, protectedLocationResult, count };
    } catch (error) {
      throw new InternalServerErrorException('Error getAnalysisDataForGFWList', error.message);
    }
  }
}
