import { ClientStoreConnection } from '../util';

import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ActivityLog, ListsPalmOilMills } from '../entity';
const logger = new Logger('GfwLists');

export class GfwLists {
    private readonly logger = new Logger('List processing service');
    private readonly clientStoreConnection = new ClientStoreConnection();
  
    async GetPaginatedPalmOilMillAttributes(
      pageNum: number,
      list_id: number,
      pageSize: number,
      organizationDatabase: string,
      organization_user_id: number
    ): Promise<boolean> {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(ListsPalmOilMills);
      const listFound = await listRepository.findOne({ where: { id: list_id } });
      if (!listFound) {
        this.logger.error('DeleteList: list not found');
        throw new NotFoundException(`List id ${list_id} not found.`);
      }
      const activityLogRepository = connection.getRepository(ActivityLog);
      // Salve log at ActivityLog table
      const activityLog = new ActivityLog();
      activityLog.userId = organization_user_id;
      activityLog.activityTypeId = 21;
      activityLog.activityDescription = `User '${organization_user_id}' has deleted list (${list_id}).`;
      activityLog.activityTime = new Date();
      await activityLogRepository.save(activityLog);
      return true
    }
}