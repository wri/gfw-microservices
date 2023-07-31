import { RepositoryMssqlSP } from '../../Shared/infraestructure/mysql/repository.mysql';
import ResultPromise from '../../Shared/domain/result/result.promise';
import Result from '../../Shared/domain/result';
import { UserRepository } from '../domain/user.repository';
import { User, UserOrganization } from '../domain/user';
import { UserMapper } from '../application/user.mapper';
import { ConnectionAdminOrganizationDbDto } from '../../Connection/application/dtos/connection-admin-organizations.dto';
import { UserInfo } from '@wri-monorepos/sql';
import { DataSource } from 'typeorm';

export class UserRepositoryMysql
  extends RepositoryMssqlSP
  implements UserRepository
{
  private mapper: UserMapper;

  constructor(dataSoruce: DataSource = null) {
    super(dataSoruce);
    this.mapper = new UserMapper();
  }

  async getUserAdminOrg(email: string): ResultPromise<UserOrganization[]> {
    const params = this.mapper.createStoreProcedureStringParam([
      ['email', email],
    ]);
    const getUserAdminOrganizations = this.storeProcedureFactory.create(
      'getUserAdminOrganizations',
      params,
    );
    const userAdminOrganizationsRes =
      await getUserAdminOrganizations.getMany<ConnectionAdminOrganizationDbDto>();

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
      'getUserInfoByEmail',
      params,
    );

    const userInfoRes = await getUserByEmail.execute<UserInfo>(db);
    if (userInfoRes.isSuccess) {
      const userInfo = userInfoRes.getValue();
      const user = this.mapper.toUserDetails(userInfo);
      return Result.ok(user);
    }

    return Result.fail(userInfoRes.getError());
  }
}
