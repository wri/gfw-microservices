import ResultPromise from '../../Shared/domain/result/result.promise';
import { User, UserOrganization } from '../domain/user';

export abstract class UserRepository {
  abstract getUserByEmail(email: string, db: string): ResultPromise<User>;

  abstract getUserAdminOrg(email: string): ResultPromise<UserOrganization[]>;
}
