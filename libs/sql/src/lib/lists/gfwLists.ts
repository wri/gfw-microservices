import { ClientStoreConnection } from '../util';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ListsPalmOilMills, GFWLists, AnalysisPalmOilMills } from '../entity';
import { In } from 'typeorm';

const PALM_OIL_MILLS_COLUMN_NAMES = {
  locationName: 'Location Name',
  analysisRadius: 'Analysis Radius',
  size: 'Size',
  parentCompany: 'Parent Company',
  companyId: 'Company ID',
  certification: 'Certification',
  rspoMode: 'RSPO Model',
  latitude: 'Latitude',
  longitude: 'Longitude',
  locationClassification: 'Location Classification',
  commodity: 'Commodity',
  country: 'Country',
  state: 'State',
  subState: 'Sub State',
  gadmId: 'gadmid',
  groupName: 'Group Name',
  millId: 'Mill ID',
  alternativeName: 'Alternative Name',
  errorFileStoragePath: 'Geometry',
  vectorTilesLastUpdated: 'Geometry Simplified',
  globalId: 'globalid',
  locationId: 'location_id',
  list_id: 'list_id',
};
const ANALYSYS_TABLE_NAMES = {
  'analysis-palmOilMills': AnalysisPalmOilMills,
};
export class GfwLists {
  private readonly logger = new Logger('List processing service');
  private readonly clientStoreConnection = new ClientStoreConnection();

  async getPaginatedPalmOilMillAttributes(
    pageNum: number,
    pageSize: number,
    list_id: number,
    organizationDatabase: string,
    ids: number[] = []
  ): Promise<any[]> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(ListsPalmOilMills);
      const take = pageSize === 0 ? 50 : pageSize;
      const skip = pageNum > 0 ? (pageNum - 1) * take : 0;

      let items, count;

      if (ids.length > 0) {
        // If ids array is not empty, apply the where clause
        [items, count] = await listRepository.findAndCount({
          where: {
            id: In(ids),
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
      console.log('count', count);
      if (!items) {
        this.logger.error('ListsPalmOilMills: lists not found');
        throw new NotFoundException(`ListsPalmOilMills with list_id ${list_id} not found.`);
      }
      const itemsWithListId = items.map((item) => {
        return { ...item, list_id: 3 };
      });
      return this.mapObjectToColumnNames(itemsWithListId, PALM_OIL_MILLS_COLUMN_NAMES);
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

      let items, count;

      if (ids.length > 0) {
        // If ids array is not empty, apply the where clause
        [items, count] = await listRepository.findAndCount({
          where: {
            id: In(ids),
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
      console.log('count', count);
      if (!items) {
        this.logger.error('ListsPalmOilMills: lists not found');
        throw new NotFoundException(`ListsPalmOilMills with list_id ${list_id} not found.`);
      }
      const itemsWithListId = items.map((item) => {
        return { ...item, list_id: 3 };
      });
      return this.mapObjectToColumnNames(itemsWithListId, PALM_OIL_MILLS_COLUMN_NAMES);
    } catch (error) {
      throw new InternalServerErrorException('Error getAnalysisDataForGFWList', error.message);
    }
  }

  async getListAnalysisTableName(list_id: number, organizationDatabase: string): Promise<GFWLists> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = await connection.getRepository(GFWLists);
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
}
