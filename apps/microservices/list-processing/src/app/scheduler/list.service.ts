import { Injectable, Logger } from '@nestjs/common';
import { ClientStoreConnection, List, Organization } from '@wri-monorepos/sql';
import * as moment from 'moment';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {}

  private async createOrganizationConnection(organization: Organization) {
    const connection = await this.clientStoreConnection.getConnection(organization.organizationDb);
    return connection;
  }

  async unlockLists(organization: Organization) {
    const yesterday = moment().add(-1, 'days').toDate();

    const connection = await this.createOrganizationConnection(organization);

    await connection
      .createQueryBuilder()
      .update(List)
      .set({
        lockStatus: null,
        lockUserId: null,
      })
      .where('lockStatus <= :yesterday ', { yesterday })
      .execute();
  }
}
