import { ClientStoreConnection } from '../util';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityTarget } from 'typeorm';
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

const systemDatabase = 'gfwpro';

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

  async getConnection() {
    return await this.clientStoreConnection.getConnection(systemDatabase);
  }

  async getListAnalysisTableName(list_id: number): Promise<ListGFWLists> {
    try {
      const connection = await this.getConnection();
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
    filters: {
      selectedCountry?: string;
      selectedState?: string;
      selectedSubState?: string;
      selectedStates?: string[];
      selectedSubStates?: string[];
      hasError: boolean;
      selectedDesignation?: string;
      selectedDesignationType?: string;
      selectedIUCN?: string;
    },
    filterString = '',
    tableSortedBy,
    tableSortedDesc
  ) {
    if (list_id !== 1 && list_id !== 4) {
      throw new BadRequestException('Invalid list_id, list id should be either 1 or 4');
    }

    try {
      const connection = await this.getConnection();
      const listRepository = connection.getRepository(this.getAttributesListEntity(list_id));

      const take = pageSize === 0 ? this.DEFAULT_PAGE_SIZE : pageSize;
      const skip = pageNum > 0 ? pageNum * take : this.DEFAULT_PAGE_NUM;

      const queryBuilder = listRepository.createQueryBuilder();

      if (filters.selectedCountry) {
        queryBuilder.andWhere('Country = :country', { country: filters.selectedCountry });
      }

      if (
        filters.selectedStates &&
        Array.isArray(filters.selectedStates) &&
        filters.selectedStates.length > 0
      ) {
        queryBuilder.andWhere('State IN (:...states)', { states: filters.selectedStates });
      }

      if (filters.selectedState) {
        queryBuilder.andWhere('State = :state', { state: filters.selectedState });
      }

      if (filters.selectedSubState) {
        queryBuilder.andWhere('"Sub State" = :subState', { subState: filters.selectedSubState });
      }

      if (
        filters.selectedSubStates &&
        Array.isArray(filters.selectedSubStates) &&
        filters.selectedSubStates.length > 0
      ) {
        queryBuilder.andWhere(`"Sub State" IN (:...subStates)`, {
          subStates: filters.selectedSubStates,
        });
      }

      if (filters.hasError) {
        queryBuilder.andWhere('ErrorDetails IS NOT NULL AND LEN(ErrorDetails) > 0');
      }

      if (filters.selectedDesignation) {
        queryBuilder.andWhere('Designation = :designation', {
          designation: filters.selectedDesignation,
        });
      }

      if (filters.selectedDesignationType && filters.selectedDesignationType !== '') {
        queryBuilder.andWhere('"Designation Type" = :designationType', {
          designationType: filters.selectedDesignationType,
        });
      }

      if (filters.selectedIUCN) {
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
