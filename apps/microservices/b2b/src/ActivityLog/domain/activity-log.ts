import { User } from '../../User/domain/user';

export class ActivityLog {
  user: User;
  type: number;
  description: number;
  time: number;
}
