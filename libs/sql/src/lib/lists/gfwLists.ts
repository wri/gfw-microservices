import { ClientStoreConnection } from '../util';

import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ActivityLog, ListsPalmOilMills } from '../entity';
const logger = new Logger('GfwLists');
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
  id: 'list_id',
};
export class GfwLists {
  private readonly logger = new Logger('List processing service');
  private readonly clientStoreConnection = new ClientStoreConnection();

  async GetPaginatedPalmOilMillAttributes(
    pageNum: number,
    pageSize: number,
    list_id: number,
    organizationDatabase: string
  ): Promise<any[]> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(ListsPalmOilMills);
      const take = pageSize === 0 ? 50 : pageSize;
      const skip = pageNum > 0 ? (pageNum - 1) * take : 0;
      const [items, count] = await listRepository.findAndCount({
        skip,
        take,
        order: {
          id: 'DESC',
        },
      });
      if (!items) {
        this.logger.error('DeleteList: list not found');
        throw new NotFoundException(`List id ${list_id} not found.`);
      }
      // const activityLogRepository = connection.getRepository(ActivityLog);
      // // Salve log at ActivityLog table
      // const activityLog = new ActivityLog();
      // activityLog.userId = organization_user_id;
      // activityLog.activityTypeId = 21;
      // activityLog.activityDescription = `User '${organization_user_id}' has deleted list (${list_id}).`;
      // activityLog.activityTime = new Date();
      // await activityLogRepository.save(activityLog);
      return this.mapObjectToColumnNames(items, PALM_OIL_MILLS_COLUMN_NAMES);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting list', error.message);
    }
  }
  private mapObjectToColumnNames(inputArray: any[], COLUMN_NAMES: any): any {
    return inputArray.map((inputObject) => {
      const mappedObject: any = {};

      for (const [key, columnName] of Object.entries(COLUMN_NAMES)) {
        if (inputObject.hasOwnProperty(key)) {
          mappedObject[`${columnName}`] = inputObject[key];
        }
      }

      return mappedObject;
    });
  }
}
