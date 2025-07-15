import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';

@Injectable()
export class LockListService {
  private readonly logger = new Logger('List Processing: Lock List service');

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {}

  public async lockList(
    organizationDatabase: string,
    list_id: number,
    organization_user_id: number
  ): Promise<boolean> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(Lists);
      const { lockStatus } = (await listRepository.findOne({ where: { id: list_id } })) ?? {
        lockStatus: '',
      };

      if (lockStatus !== null) {
        return false;
      }

      await listRepository.update(
        { id: list_id },
        { lockStatus: new Date(), lockUserId: organization_user_id }
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to lock list ${list_id}`,
        code: 610,
      });
    }
  }

  public async unlockList(
    organizationDatabase: string,
    list_id: number,
    organization_user_id: number
  ): Promise<boolean> {
    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(Lists);
      const list = await listRepository.findOne({ where: { id: list_id } });
      if (!list) {
        return false;
      }
      const { lockStatus, lockUserId } = list;

      if (lockStatus !== null && lockUserId !== organization_user_id) {
        return false;
      }

      await listRepository.update(
        { id: list_id },
        { lockStatus: null, lockUserId: organization_user_id }
      );
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `Failed to unlock list ${list_id}`,
        code: 610,
      });
    }
  }
}
