import { Injectable } from '@nestjs/common';
import Result from '../../Shared/domain/result';
import ResultPromise from '../../Shared/domain/result/result.promise';
import { UserRepository } from '../domain/user.repository';

@Injectable()
export class UserUseCases {
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
}
