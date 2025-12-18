import { Injectable, Logger } from '@nestjs/common';
import { ClientStoreConnection, Lists, Organization } from '@wri-monorepos/sql';
import { subDays } from 'date-fns';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {}

  private async createOrganizationConnection(organization: Organization) {
    const connection = await this.clientStoreConnection.getConnection(organization.organizationDb);
    return connection;
  }

  async unlockLists(organization: Organization) {
    const yesterday = subDays(new Date(), 1);

    const connection = await this.createOrganizationConnection(organization);

    await connection
      .createQueryBuilder()
      .update(Lists)
      .set({
        lockStatus: null,
        lockUserId: null,
      })
      .where('lockStatus <= :yesterday ', { yesterday })
      .execute();
  }
}
