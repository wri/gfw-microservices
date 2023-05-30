import { Inject, Injectable } from '@nestjs/common';
import { ListUseCases } from '../../List/application/list.use-case';

import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class UserUseCases {
  @Inject(ListUseCases)
  private readonly listUseCases: ListUseCases;

  constructor(private userRepo: UserRepository) {}

  async getUserDB(
    email: string,
    organizationId: number,
  ): ResultPromise<string> {
    const res = await this.userRepo.getUserAdminOrg(email);
    if (res.isSuccess) {
      const userOrganizations = res.getValue();
      const organization = userOrganizations.find((userOrganization) => {
        return userOrganization.id == organizationId;
      });
      if (organization) {
        return Result.ok(organization.organizationDb);
      }
    }
  }

  async checkUserIsListAdmin(
    email: string,
    listId: number,
    db: string,
  ): Promise<boolean> {
    const promises = await Promise.allSettled([
      this.userRepo.getUserByEmail(email, db),
      this.userRepo.getUserAdminOrg(email),
      this.listUseCases.findListById(listId),
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
}
