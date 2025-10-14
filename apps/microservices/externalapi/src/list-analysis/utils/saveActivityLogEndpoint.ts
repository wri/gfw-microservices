import { UserService } from '../user.service';
import { Injectable } from '@nestjs/common';
import { ListActivityTypesEnum } from '@wri-monorepos/constants';
import { ActivityLog, ClientStoreConnection, Organization } from '@wri-monorepos/sql';
@Injectable()
export class SaveActivityLogEndpoint {
  constructor(
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly userService: UserService
  ) {}
  async saveActivityLogEndpoint(
    organizationDetails: Organization,
    organization_user_id: number,
    endpoint: string,
    endpointActivityTypeId: ListActivityTypesEnum
  ) {
    if (
      organization_user_id === null ||
      organization_user_id === undefined ||
      endpoint === null ||
      endpoint === undefined ||
      endpointActivityTypeId === null ||
      endpointActivityTypeId === undefined
    ) {
      return;
    }
    const connection = await this.clientStoreConnection.getConnection(
      organizationDetails.organizationDb
    );

    const activityLogRepository = connection.getRepository(ActivityLog);
    try {
      await activityLogRepository.save({
        userId: organization_user_id,
        activityTypeId: endpointActivityTypeId,
        activityDescription: `The endpoint ${endpoint} was accessed by user ${organization_user_id}`, // string is referenced in tools/db_to_s3_for_athena/sql/clientstore_api_calls_volume.sql
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
