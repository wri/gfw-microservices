import { Injectable, Logger } from '@nestjs/common';
import { ClientStoreConnection, List, Organization } from '@wri-monorepos/sql';
import { LessThan } from 'typeorm';
import * as moment from 'moment';

@Injectable()
export class ListService {
  private readonly logger = new Logger(ListService.name);

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {}

  async findLockedLists(organization: Organization) {
    const connection = await this.createOrganizationConnection(organization);

    const listRepository = connection.getRepository(List);
    const yesterday = moment().add(-1, 'days').toDate();

    const list = listRepository.find({
      where: {
        lockStatus: LessThan(yesterday),
      },
    });

    return list;
  }

  private async createOrganizationConnection(organization: Organization) {
    const connection = await this.clientStoreConnection.getConnection(organization.organizationDb);
    return connection;
  }

  async unlockLists(organization: Organization, lists: List[]) {
    const ids = lists.map((list) => list.id);
    this.logger.log(`Unlocking lists ${ids.join(', ')}`);

    const connection = await this.createOrganizationConnection(organization);
    const listRepository = connection.getRepository(List);

    for (let i = 0; i < lists.length; i++) {
      const { id } = lists[i];
      await listRepository.update(id, {
        lockStatus: null,
        lockUserId: null,
      });
    }
  }
}
