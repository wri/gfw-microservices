import { Inject, Injectable } from '@nestjs/common';
import { ListUseCases } from '../../List/application/list.use-case';
import { ERRORS } from '../../Shared/domain/constants';

import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
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
      } else {
        return Result.fail(ERRORS.NOT_ELEMENTS_FOUND);
      }
    }
  }

  async checkUserIsListAdmin(
    email: string,
    listId: number,
    db: string,
    orgId,
  ): ResultPromise<boolean> {
    const userPromise = await this.userRepo.getUserByEmail(email, db);
    const userAdminOrgsPromise = await this.userRepo.getUserAdminOrg(email);
    const listPromise = await this.listUseCases.findListById(listId, orgId);

    const validatePromise = <T, R>(promise: Result<T, R>) => {
      if (promise.isSuccess) {
        return promise.getValue();
      }
      console.log(promise.getError());
      return null;
    };

    const user = validatePromise(userPromise);
    const userAdminOrgs = validatePromise(userAdminOrgsPromise);
    const list = validatePromise(listPromise);

    const result =
      user &&
      list &&
      userAdminOrgs.some((org) => Number(org.id) === Number(orgId));

    return result
      ? Result.ok(result)
      : Result.fail(
          new ResultError('this user not able to access this list', 500),
        );
  }
}
