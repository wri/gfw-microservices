import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import ResultError from '../../Shared/domain/result/result.error';
import { UserRepository } from '../domain/user.repository';
import { User, UserOrganization } from '../domain/user';
import { UserMapper } from '../application/user.mapper';
import { ConnectionAdminOrganizationDbDto } from '../../Connection/application/dtos/connection-admin-organizations.dto';

export class UserRepositoryMysql
  extends RepositoryMysql
  implements UserRepository
{
  private mapper: UserMapper;

  constructor() {
    super();
    this.mapper = new UserMapper();
  }
  async getUserAdminOrg(email: string): ResultPromise<UserOrganization[]> {
    const params = this.mapper.createStoreProcedureStringParam([
      ['email', email],
    ]);
    const getUserAdminOrganizations = this.storeProcedureFactory.create(
      'uspGetUserAdminOrganizations',
      params,
    );
    const userAdminOrganizationsRes = await getUserAdminOrganizations.execute<
      ConnectionAdminOrganizationDbDto[]
    >();

    if (userAdminOrganizationsRes.isSuccess) {
      const userAdminOrganizations = userAdminOrganizationsRes.getValue();
      const userOrganizations = this.mapper.toUserOrganizationArrayWrapper()(
        userAdminOrganizations,
      );
      return Result.ok(userOrganizations);
    }
    return Result.fail(userAdminOrganizationsRes.getError());
  }

  async getUserByEmail(email: string, db: string = null): ResultPromise<User> {
    const params = this.mapper.toEmailParam(email);
    const getUserByEmail = this.storeProcedureFactory.create(
      'uspGetUserInfoByEmail',
      params,
    );
    const user = await getUserByEmail.execute<User>(db);
    return user;
  }

}
