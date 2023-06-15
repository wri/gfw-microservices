import { Inject, Injectable } from '@nestjs/common';
import { SharedListRepository } from '../domain/shared-list.repository';
import { SharedList } from '../domain/shared-list.entity';
import { ConnectionUseCases } from '../../Connection/application/connection.use-case';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { UserUseCases } from '../../User/application/user.use-case';
import Result from '../../Shared/domain/result';
import { OrganizationUseCases } from '../../Organization/application/organization.use-case';
import { ERRORS } from '../../Shared/domain/constants';
import { QueryCriteria } from '../../Shared/domain/criteria/query';
import { SearchResult } from '../../Shared/domain/types';

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
    const connectionResult =
      await this.connectionUseCases.getConnectionRequestID(orgId, orgTargetId);

    if (connectionResult.isFailure || connectionResult.getValue() === null)
      return Result.fail(ERRORS.HAS_NOT_CONNECTIONS_WITH_COMPANY);

    const orgRes = await this.organizationUseCases.findById(orgId);

    if (orgRes.isFailure) return Result.fail(orgRes.getError());

    const organization = orgRes.getValue();
    const checkRes = await this.userUseCases.checkUserIsListAdmin(
      userEmail,
      listId,
      organization.organizationDb,
      orgId,
    );

    if (checkRes.isFailure || !checkRes.getValue())
      return Result.fail(checkRes.getError());

    const sharedList = new SharedList();
    sharedList.idConnectionRequest = connectionResult.getValue().id;
    sharedList.idList = listId;
    sharedList.sharedWithGeometry = true;
    sharedList.enabled = true;
    sharedList.editedDate = new Date();

    return await this.sharedListRepository.create(sharedList);
  }

  async search(query: QueryCriteria): ResultPromise<SearchResult<SharedList>> {
    return await this.sharedListRepository.search(query);
  }

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
