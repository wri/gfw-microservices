import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../User/domain/user.repository';
import { SharedListRepository } from '../domain/shared-list.repository';
import { ListRepository } from '../../List/domain/list.repository';
import { User } from '../../User/domain/user';
import { SharedList } from '../domain/shared-list.entity';
import { ConnectionUseCases } from '../../Connection/application/connection.use-case';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { ConnectionRequest } from '../../Connection/domain/connection.entity';
import { UserUseCases } from '../../User/application/user.use-case';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
import { OrganizationUseCases } from '../../Organization/application/organization.use-case';
import { ERRORS } from '../../Shared/domain/constants';

@Injectable()
export class SharedListUseCases {
  constructor(private readonly sharedListRepository: SharedListRepository) {}

  @Inject(ConnectionUseCases)
  private readonly connectionUseCases: ConnectionUseCases;

  @Inject(UserUseCases)
  private readonly userUseCases: UserUseCases;

  @Inject(OrganizationUseCases)
  private readonly organizationUseCases: OrganizationUseCases;

  async createSharedList(
    orgId: number,
    { userEmail, listId, orgTargetId },
  ): ResultPromise<SharedList> {
    const promisesSettled = await Promise.allSettled([
      this.connectionUseCases.getConnections({
        sourceId: orgId,
        //targetId: orgTargetId,
        status: 'accepted',
      }),
      this.connectionUseCases.getConnections({
        sourceId: orgTargetId,
        //targetId: orgId,
        status: 'accepted',
      }),
    ]);

    const connections: ConnectionRequest[] = promisesSettled.reduce(
      (acc, promise) => {
        const items = this.validatePromise(promise);
        if (items) return [...acc, ...items];
        return acc;
      },
      [],
    );
    const connectionId = connections[0] && connections[0].id;

    if (!connectionId) Result.fail(ERRORS.HAS_NOT_CONNECTIONS_WITH_COMPANY);

    const orgRes = await this.organizationUseCases.findById(orgId);

    if (orgRes.isFailure) return Result.fail(orgRes.getError());

    const organization = orgRes.getValue();
    const checkRes = await this.userUseCases.checkUserIsListAdmin(
      userEmail,
      listId,
      organization.organizationDb,
    );

    if (checkRes.isFailure || !checkRes.getValue())
      return Result.fail(checkRes.getError());

    const sharedList = new SharedList();
    sharedList.idConnectionRequest = connectionId;
    sharedList.idList = listId;
    sharedList.sharedWithGeometry = true;
    sharedList.enabled = true;
    sharedList.editedDate = new Date();

    return await this.sharedListRepository.create(sharedList);
  }

  private validatePromise = <T>(
    promise: PromiseSettledResult<Result<T[], ResultError>>,
  ) => {
    if (promise.status == 'fulfilled' && promise.value.isSuccess) {
      return promise.value.getValue();
    }
    return null;
  };
  /*

  async updateSharedList(
    email: string,
    listId: number,
    sharedList: SharedList,
  ): Promise<SharedList> {
    const isAdmin = await this.checkUserIsListAdmin(email, listId, 'clientstore-DevCo');
    if (!isAdmin) {
      throw new Error(
        'User Is not admin',
      );
    }
    const updatedSharedList = await this.sharedListRepository.update(
      listId,
      sharedList,
    );
    return updatedSharedList;
  }

  async deleteSharedList(email: string, listId: number): Promise<void> {
    const isAdmin = await this.checkUserIsListAdmin(email, listId, 'clientstore-DevCo');
    if (!isAdmin) {
      throw new Error(
        'User Is not admin',
      );
    }
    await this.sharedListRepository.delete(listId);
  }

  private async checkUserIsListAdmin(
    email: string,
    listId: number,
    db: string,
  ): Promise<boolean> {
    const promises = await Promise.allSettled([
      this.userRepository.getUserByEmail(email, db),
      this.userRepository.getUserAdminOrg(email),
      this.listRepository.findListById(listId),
    ]);

    const [userPromise, userAdminOrgsPromise, listPromise] = promises;

    const validatePromise = (promise) => {
      if (promise.status == 'fulfilled' && promise.value.isSuccess) {
        return promise.value.getValue();
      }
      return null;
    };

    const user = validatePromise(userPromise);
    const userAdminOrgs = validatePromise(userAdminOrgsPromise);
    const list = validatePromise(listPromise);

    return user && list && userAdminOrgs.some((org) => org.listId === listId);
  }

  //TODO: Create a utils service for this kind of logic
  private validatePromise = (promise) => {
    if (promise.status == 'fulfilled' && promise.value.isSuccess) {
      return promise.value.getValue();
    }
    return null;
  };
  */
}
