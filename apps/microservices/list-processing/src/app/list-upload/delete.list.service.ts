import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ActivityLog, ClientStoreConnection, DeleteListTypeOrm } from '@wri-monorepos/sql';

@Injectable()
export class DeleteListService {
  constructor(
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly deleteListTypeOrm: DeleteListTypeOrm,
    private readonly logger: Logger
  ) {}

  async run(
    list_id: number,
    organizationDatabase: string,
    organization_user_id: number,
    userEmail: string
  ): Promise<string> {
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const activityLogRepository = connection.getRepository(ActivityLog);

    try {
      // await DeleteList(organizationDatabase, list_id, organization_user_id);
      const deleteResult = await this.deleteListTypeOrm.delete(
        organizationDatabase,
        list_id,
        organization_user_id
      );
      if (deleteResult) {
        // Save log at ActivityLog table
        const activityLog = new ActivityLog();
        activityLog.userId = organization_user_id;
        activityLog.activityTypeId = 21;
        const confirmationMessage = `User '${userEmail}' has deleted list (${list_id}).`;
        activityLog.activityDescription = confirmationMessage;
        activityLog.activityTime = new Date();
        await activityLogRepository.save(activityLog);

        // Return message that the list was deleted to user
        return confirmationMessage;
      } else {
        throw new InternalServerErrorException({
          message: `Failed to delete list ${list_id}`,
          code: 610,
        });
      }
    } catch (error) {
      this.logger.error('DeleteList failure', error);
      const activityLog = new ActivityLog();
      activityLog.userId = organization_user_id;
      activityLog.activityTypeId = 21;
      const errorDescription = `User '${userEmail}' has tried to delete list (${list_id}) but some error occurs ${error.message}.`;
      activityLog.activityDescription = errorDescription;
      activityLog.activityTime = new Date();
      await activityLogRepository.save(activityLog);
      throw new InternalServerErrorException({
        message: errorDescription,
        code: 603,
      });
    }
  }
}
