import { ClientStoreConnection } from '../util';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityTarget, FindOptionsWhere, Raw } from 'typeorm';
import {
  ListsPalmOilMills,
  ListGFWLists,
  AnalysisPalmOilMills,
  AnalysisAdministrativesAreas,
  AnalysisOilPalmConcessions,
  AnalysisProtectedAreas,
  AnalysisRspoOilPalmConcessions,
  RspoOilPalmConcessions,
  ListOilPalmConcessions,
  ListProtectedAreas,
  ListAdministrativeAreas,
} from '../entity';

export class GfwLists {
  private readonly logger = new Logger('List processing service');
  private readonly clientStoreConnection = new ClientStoreConnection();
  private readonly DEFAULT_PAGE_SIZE: number = 50;
  private readonly DEFAULT_PAGE_NUM: number = 0;

  getAnalysisTableNameEntity(
    analysisTableName: string
  ): EntityTarget<
    | AnalysisPalmOilMills
    | AnalysisProtectedAreas
    | AnalysisAdministrativesAreas
    | AnalysisOilPalmConcessions
    | AnalysisRspoOilPalmConcessions
  > {
    const ANALYSYS_TABLE_NAMES = {
      'analysis-palmOilMills': AnalysisPalmOilMills,
      'analysis-protectedAreas': AnalysisProtectedAreas,
      'analysis-administrativeAreas': AnalysisAdministrativesAreas,
      'analysis-oilPalmConcessions': AnalysisOilPalmConcessions,
      'analysis-rspoOilPalmConcessions': AnalysisRspoOilPalmConcessions,
    };
    return ANALYSYS_TABLE_NAMES[analysisTableName];
  }
  getAttributesListEntity(
    list_id: number
  ): EntityTarget<
    | ListOilPalmConcessions
    | ListsPalmOilMills
    | RspoOilPalmConcessions
    | ListAdministrativeAreas
    | ListProtectedAreas
  > {
    const ATTRIBUTES_LIST_TABLE = ListsPalmOilMills;
    const ATTRIBUTES_LIST_TABLE_NAMES = {
      1: ListAdministrativeAreas,
      2: ListOilPalmConcessions,
      3: ListsPalmOilMills,
      4: ListProtectedAreas,
      5: RspoOilPalmConcessions,
    };
    return ATTRIBUTES_LIST_TABLE_NAMES[list_id] || ATTRIBUTES_LIST_TABLE;
  }

  async getConnection(organizationDatabase: string) {
    return await this.clientStoreConnection.getConnection(organizationDatabase);
  }

  async getPaginatedAttributes(
    organizationDatabase: string,
    list_id: number,
    pageNum = 0,
    pageSize = 50,
    filters: any = {},
    filterString = '',
    tableSortedBy: string,
    tableSortedDesc: boolean
  ): Promise<
    [ListOilPalmConcessions[] | ListsPalmOilMills[] | RspoOilPalmConcessions[] | any[], number]
  > {
    if (list_id !== 2 && list_id !== 3 && list_id !== 5) {
      throw new BadRequestException('Invalid list_id, list id should be 2, 3 or 5');
    }
    try {
      const connection = await this.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(this.getAttributesListEntity(list_id));

      const take = pageSize === 0 ? this.DEFAULT_PAGE_SIZE : pageSize;
      const skip = pageNum > 0 ? pageNum * take : this.DEFAULT_PAGE_NUM;

      let queryBuilder;

      if (
        list_id === 3 &&
        (filters.selectedOverallThreats?.length ||
          filters.selectedOverallValues?.length ||
          filters.selectedMillPriority?.length)
      ) {
        // if these filter values are not set we don't need to make this table join
        // after we fix the sorting issue https://gfw.atlassian.net/browse/GPV-3774 we can remove the checks on the filtering and just leave the list_id check

        // we join the analysis table if the list is Palm Oil Mills so we can filter by commodity risk values
        queryBuilder = listRepository
          .createQueryBuilder('listTable')
          .leftJoin('listTable.analysis', 'analysis');
      } else {
        queryBuilder = listRepository.createQueryBuilder('listTable');
      }

      if (filters.selectedCountry && filters.selectedCountry !== '') {
        queryBuilder.andWhere('listTable.Country = :country', { country: filters.selectedCountry });
      }

      if (filters.selectedState && filters.selectedState !== '') {
        queryBuilder.andWhere('listTable.State = :state', { state: filters.selectedState });
      }

      if (filters.selectedSubState && filters.selectedSubState !== '') {
        queryBuilder.andWhere('listTable."Sub State" = :subState', {
          subState: filters.selectedSubState,
        });
      }

      if (filters.selectedOverallThreats && filters.selectedOverallThreats.length) {
        queryBuilder.andWhere(
          `(SELECT TOP 1 CAST(value AS INT) FROM OPENJSON(analysis.commodity_threat_overall_level)
           WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(analysis.commodity_threat_overall_level) ORDER BY [key] DESC)
           AND CAST(value AS INT) IN (:...selectedOverallThreats)) IS NOT NULL`,
          { selectedOverallThreats: filters.selectedOverallThreats }
        );
      }

      if (filters.selectedOverallValues && filters.selectedOverallValues.length) {
        queryBuilder.andWhere(
          `(SELECT TOP 1 CAST(value AS INT) FROM OPENJSON(analysis.commodity_value_overall_level)
           WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(analysis.commodity_value_overall_level) ORDER BY [key] DESC)
           AND CAST(value AS INT) IN (:...selectedOverallValues)) IS NOT NULL`,
          { selectedOverallValues: filters.selectedOverallValues }
        );
      }

      if (filters.selectedMillPriority && filters.selectedMillPriority.length) {
        queryBuilder.andWhere(
          `(SELECT TOP 1 CAST(value AS INT) FROM OPENJSON(analysis.commodity_mill_priority_level)
           WHERE [key] = (SELECT TOP 1 [key] FROM OPENJSON(analysis.commodity_mill_priority_level) ORDER BY [key] DESC)
           AND CAST(value AS INT) IN (:...selectedMillPriority)) IS NOT NULL`,
          { selectedMillPriority: filters.selectedMillPriority }
        );
      }

      if (filterString && filterString.trim() !== '') {
        queryBuilder.andWhere(
          `(listTable.Country LIKE :filterString OR listTable.State LIKE :filterString OR listTable."Location Name" LIKE :filterString)`,
          { filterString: `%${filterString}%` }
        );
      }
      queryBuilder.skip(skip).take(take);
      const sortOrder: 'DESC' | 'ASC' = tableSortedDesc ? 'DESC' : 'ASC';
      if (
        list_id === 3 &&
        (filters.selectedOverallThreats?.length ||
          filters.selectedOverallValues?.length ||
          filters.selectedMillPriority?.length)
      ) {
        // temporary harcoded value as the sorting for commodity risk is fixed https://gfw.atlassian.net/browse/GPV-3774
        queryBuilder.orderBy('listTable.location_id', sortOrder);
      } else {
        queryBuilder.orderBy(
          tableSortedBy.length ? `listTable."${tableSortedBy}"` : 'listTable.location_id',
          sortOrder
        );
      }

      const [items, count] = await queryBuilder.getManyAndCount();

      if (!items) {
        this.logger.error('ListsPalmOilMills: lists not found');
        throw new NotFoundException(`ListsPalmOilMills with list_id ${list_id} not found.`);
      }

      const itemsWithListId = items.map((item) => {
        return { ...item, list_id };
      });

      return [itemsWithListId, count];
    } catch (error) {
      throw new InternalServerErrorException('Error getting paginated list data', error.message);
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
      const connection = await this.getConnection(organizationDatabase);
      const listTableName = await this.getListAnalysisTableName(list_id, organizationDatabase);

      const listRepository = connection.getRepository(
        this.getAnalysisTableNameEntity(listTableName.list_analysis_table_name)
      );

      const take = pageSize === 0 ? this.DEFAULT_PAGE_SIZE : pageSize;
      const skip = pageNum > 0 ? pageNum * take : this.DEFAULT_PAGE_NUM;

      let items, count;
      const where: FindOptionsWhere<
        | AnalysisPalmOilMills
        | AnalysisAdministrativesAreas
        | AnalysisOilPalmConcessions
        | AnalysisProtectedAreas
        | AnalysisRspoOilPalmConcessions
      > = {};
      if (ids.length > 0) {
        // If ids array is not empty, apply the where clause
        [items, count] = await listRepository.findAndCount({
          where: {
            ...where,
            LocationId: Raw((alias) => `${alias} IN (:...names)`, {
              names: ids,
            }),
          },
          skip,
          take,
          order: {
            LocationId: 'DESC',
          },
        });
      } else {
        [items, count] = await listRepository.findAndCount({
          skip,
          take,
          order: {
            LocationId: 'DESC',
          },
        });
      }
      if (!items) {
        this.logger.error(`${listTableName.list_analysis_table_name}: lists not found`);
        throw new NotFoundException(
          `${listTableName.list_analysis_table_name} with list_id ${list_id} not found.`
        );
      }
      const itemsWithListId = items.map((item) => {
        return { ...item, list_id };
      });
      const number_of_pages = Math.ceil(count / take);
      return [itemsWithListId, count, number_of_pages];
    } catch (error) {
      throw new InternalServerErrorException(
        `Error getAnalysisDataForGFWList for gfwList id ${list_id}`,
        error.message
      );
    }
  }

  async getListAnalysisTableName(
    list_id: number,
    organizationDatabase: string
  ): Promise<ListGFWLists> {
    try {
      const connection = await this.getConnection(organizationDatabase);
      const listRepository = await connection.getRepository(ListGFWLists);
      const listName = await listRepository.findOne({ where: { id: list_id } });
      return listName;
    } catch (error) {
      throw new InternalServerErrorException('Error when get list_analysis_table', error.message);
    }
  }

  async getPaginatedAnalysisDataForProtectedAndAdministrativeAreas(
    list_id: number,
    pageNum = 0,
    pageSize = 0,
    organizationDatabase: string,
    filters,
    filterString = '',
    tableSortedBy,
    tableSortedDesc
  ) {
    if (list_id !== 1 && list_id !== 4) {
      throw new BadRequestException('Invalid list_id, list id should be either 1 or 4');
    }

    try {
      const connection = await this.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(this.getAttributesListEntity(list_id));

      const take = pageSize === 0 ? this.DEFAULT_PAGE_SIZE : pageSize;
      const skip = pageNum > 0 ? pageNum * take : this.DEFAULT_PAGE_NUM;

      const queryBuilder = listRepository.createQueryBuilder();

      if (filters.selectedCountry && filters.selectedCountry !== '') {
        queryBuilder.andWhere('Country = :country', { country: filters.selectedCountry });
      }

      if (filters.selectedState && filters.selectedState !== '') {
        queryBuilder.andWhere('State = :state', { state: filters.selectedState });
      }

      if (filters.selectedSubState && filters.selectedSubState !== '') {
        queryBuilder.andWhere('"Sub State" = :subState', { subState: filters.selectedSubState });
      }

      if (filters.selectedDesignation && filters.selectedDesignation !== '') {
        queryBuilder.andWhere('Designation = :designation', {
          designation: filters.selectedDesignation,
        });
      }

      if (filters.selectedDesignationType && filters.selectedDesignationType !== '') {
        queryBuilder.andWhere('"Designation Type" = :designationType', {
          designationType: filters.selectedDesignationType,
        });
      }

      if (filters.selectedIUCN && filters.selectedIUCN !== '') {
        queryBuilder.andWhere('"IUCN CAT" = :iucnCat', { iucnCat: filters.selectedIUCN });
      }

      if (filterString && filterString.trim() !== '') {
        queryBuilder.andWhere(
          `(Country LIKE :filterString OR State LIKE :filterString OR "Location Name" LIKE :filterString)`,
          { filterString: `%${filterString}%` }
        );
      }

      const sortOrder: 'DESC' | 'ASC' = tableSortedDesc ? 'DESC' : 'ASC';
      const sanitizedSortColumn = tableSortedBy?.includes(' ')
        ? `"${tableSortedBy}"`
        : tableSortedBy || 'id';
      const sortColumn = sanitizedSortColumn === 'total_area' ? 'Size' : sanitizedSortColumn;

      queryBuilder.skip(skip).take(take).orderBy(sortColumn, sortOrder);

      const [items, count] = await queryBuilder.getManyAndCount();
      if (!items) {
        this.logger.error('Analysis data: items not found');
        throw new NotFoundException(`Data with list_id ${list_id} not found.`);
      }

      const itemsWithListId = items.map((item) => {
        return { ...item, 'Location Name': item['LocationName'] };
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
          if (record?.[field]) {
            filteredRecord[field] = record[field];
          }
        }
        return { ...filteredRecord, id: record.location_id, location_id: record.location_id };
      });

      const omitFields = (record, fields: string[]): any => {
        const filteredRecord: any = {};
        for (const field in record) {
          if (!fields.includes(field)) {
            filteredRecord[field] = record?.[field];
          }
        }
        return filteredRecord;
      };

      const protectedLocationResult = itemsWithListId.map((record) => {
        return omitFields(record, listDataFields);
      });

      return { listData, protectedLocationResult, count };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error getting paginated analysis data',
        error.message
      );
    }
  }
}
