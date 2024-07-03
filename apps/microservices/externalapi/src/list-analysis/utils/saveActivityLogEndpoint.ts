import {
  ActivityLog,
  ClientStoreConnection as ClientStoreConnectionLibSql,
} from '@wri-monorepos/sql';
import { UserService } from '../user.service';
import { Injectable } from '@nestjs/common';
import { Organization } from '../../api-keys/organization.entity';
import { ListActivityTypesEnum } from '@wri-monorepos/constants';
@Injectable()
export class SaveActivityLogEndpoint {
  constructor(
    private readonly clientStoreConnectionLibSql: ClientStoreConnectionLibSql,
    private readonly userService: UserService
  ) {}
  async saveActivityLogEndpoint(
    organizationDetails: Organization,
    organization_user_id: number,
    endpoint: string,
    endpointActivityTypeId: ListActivityTypesEnum
  ) {
    if (organization_user_id === null || organization_user_id === undefined) {
      return;
    }
    const connectionLibSql = await this.clientStoreConnectionLibSql.getConnection(
      organizationDetails.organizationDb
    );

    const activityLogRepository = connectionLibSql.getRepository(ActivityLog);
    try {
      const { user_email: userEmail } = await this.userService.findUserByAttributes({
        organization_id: organizationDetails.id,
        organization_user_id,
      });
      await activityLogRepository.save({
        userId: organization_user_id,
        activityTypeId: endpointActivityTypeId,
        activityDescription: `The endpoint ${endpoint} was accessed by user ${userEmail}`,
        activityTime: new Date(),
      });
    } catch (error) {
      await activityLogRepository.save({
        userId: organization_user_id,
        activityTypeId: endpointActivityTypeId,
        activityDescription: `Failed to save activity log for endpoint ${endpoint}  ${error.message}`,
        activityTime: new Date(),
      });
    }
  }
}
