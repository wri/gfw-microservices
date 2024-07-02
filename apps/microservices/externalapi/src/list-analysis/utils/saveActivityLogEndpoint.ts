import {
  ActivityLog,
  ClientStoreConnection as ClientStoreConnectionLibSql,
} from '@wri-monorepos/sql';
import { UserService } from '../user.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Organization } from '../../api-keys/organization.entity';
import { ENDPOINT_ACTIVITY_TYPE_ID } from '../../config';

@Injectable()
export class SaveActivityLogEndpoint {
  constructor(
    private readonly clientStoreConnectionLibSql: ClientStoreConnectionLibSql,
    private readonly userService: UserService
  ) {}
  async saveActivityLogEndpoint(
    organizationDetails: Organization,
    organization_user_id: number,
    endpoint: string
  ) {
    if (organization_user_id === null || organization_user_id === undefined) {
      return;
    }
    try {
      const connectionLibSql = await this.clientStoreConnectionLibSql.getConnection(
        organizationDetails.organizationDb
      );

      const activityLogRepository = connectionLibSql.getRepository(ActivityLog);

      const { user_email: userEmail } = await this.userService.findUserByAttributes({
        organization_id: organizationDetails.id,
        organization_user_id,
      });
      await activityLogRepository.save({
        userId: organization_user_id,
        activityTypeId: ENDPOINT_ACTIVITY_TYPE_ID,
        activityDescription: `The endpoint ${endpoint} was accessed by user ${userEmail}`,
        activityTime: new Date(),
      });
    } catch (error) {
      throw new InternalServerErrorException('Error saving activity log');
    }
  }
}
